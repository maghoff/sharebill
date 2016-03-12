var React = require('react/addons');
var moment = require('moment');
var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var toMixedNumber = require('./toMixedNumber');
var evaluate = require('./calc');
var AccountInputTable = require('./account-input-table');

var RFC3339 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;

function accountArrayFromDict(dict) {
	return Object
		.keys(dict)
		.map(function (key) { return { account: key, value: dict[key] } }.bind(this));
}

function accountDictFromArray(array) {
	var dict = {};
	array.forEach(function (line) {
		if (!line) return;
		dict[line.account.trim()] = toMixedNumber(evaluate(line.value));
	});
	return dict;
}

function sum_account_inputs(inputs) {
	var sum = SchemeNumber("0");
	try {
		inputs.forEach(function (entry) {
			if (entry.value.trim() === "") return;
			sum = SchemeNumber.fn['+'](sum, evaluate(entry.value));
		});
	}
	catch (err) {
		return null;
	}
	return sum;
}

function validate_account_inputs(inputs) {
	var accounts = {};
	var valid = true;
	var entries = 0;
	inputs.forEach(function (entry) {
		entries++;

		var account = entry.account.trim();
		accounts[account] = (accounts[account] || 0) + 1;
		valid &= (accounts[account] === 1);
		valid &= account.length >= 1;

		try {
			var value = evaluate(entry.value);
			valid &= SchemeNumber.fn['positive?'](value);
		}
		catch (err) {
			valid = false;
		}
	});
	valid &= entries > 0;
	return valid;
}

var FreeformEntry = React.createClass({
	cloneState: function () {
		var state = JSON.parse(JSON.stringify(this.props.state));
		state.transaction.debits.forEach(function (value, index) { if (value == null) delete state.transaction.debits[index]; });
		state.transaction.credits.forEach(function (value, index) { if (value == null) delete state.transaction.credits[index]; });
		return state;
	},
	handleChange: function (ev) {
		var change = { meta: JSON.parse(JSON.stringify(this.props.state.meta)) };
		change.meta[ev.target.getAttribute("data-for")] = ev.target.value;
		this.props.setState(change);
	},
	stateAsDocument: function () {
		return {
			_id: this.props.state._id,
			_rev: this.props.state._rev,
			meta: {
				timestamp: this.props.state.meta.timestamp,
				description: this.props.state.meta.description
			},
			transaction: {
				debets: accountDictFromArray(this.props.state.transaction.debits),
				credits: accountDictFromArray(this.props.state.transaction.credits)
			}
		};
	},
	set: function (accountType, index, property, value) {
		var state = this.cloneState();
		state.transaction[accountType][index] = state.transaction[accountType][index] || { account: "", value: "" };
		state.transaction[accountType][index][property] = value;
		this.props.setState(state);
	},
	deleteRow: function (accountType, index) {
		var state = this.cloneState();
		delete state.transaction[accountType][index];
		this.props.setState(state);
	},
	focus: function () {
		this.getDOMNode().querySelector('[data-for="description"]').focus();
	},
	render: function () {
		var RFC3339 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
		var valid_timestamp = this.props.state.meta.timestamp.match(RFC3339);
		var valid_description = this.props.state.meta.description.trim() !== "";

		var total_debits = sum_account_inputs(this.props.state.transaction.debits);
		var total_credits = sum_account_inputs(this.props.state.transaction.credits);
		var valid_sums = total_debits && total_credits && SchemeNumber.fn['='](total_debits, total_credits);

		var missing_debits = null;
		var missing_credits = null;
		if (total_debits && total_credits) {
			if (SchemeNumber.fn['>'](total_debits, total_credits)) missing_credits = SchemeNumber.fn['-'](total_debits, total_credits);
			if (SchemeNumber.fn['>'](total_credits, total_debits)) missing_debits = SchemeNumber.fn['-'](total_credits, total_debits);
		}

		return React.createElement('div', null,
			React.createElement("dl", null,
				React.createElement("dt", null, "When"),
				React.createElement("dd", { className: "control-group" + (valid_timestamp ? "" : " error") },
					React.createElement("input", {
						value: this.props.state.meta.timestamp,
						onChange: this.handleChange,
						"data-for": "timestamp",
						disabled: this.props.saving ? "disabled" : ""
					})
				),
				React.createElement("dt", null, "What"),
				React.createElement("dd", { className: "control-group" + (valid_description ? "" : " error") },
					React.createElement("input", {
						value: this.props.state.meta.description,
						onChange: this.handleChange,
						"data-for": "description",
						disabled: this.props.saving ? "disabled" : ""
					})
				)
			),
			React.createElement(AccountInputTable, {
				type: "debits",
				values: this.props.state.transaction.debits,
				extra: missing_debits,
				set: this.set.bind(this, "debits"),
				deleteRow: this.deleteRow.bind(this, "debits"),
				enabled: !this.props.saving,
				currencyName: this.props.instanceConfig.currencyName(),
				currencyPosition: this.props.instanceConfig.currencyPosition()
			}),
			React.createElement(AccountInputTable, {
				type: "credits",
				values: this.props.state.transaction.credits,
				extra: missing_credits,
				set: this.set.bind(this, "credits"),
				deleteRow: this.deleteRow.bind(this, "credits"),
				enabled: !this.props.saving,
				currencyName: this.props.instanceConfig.currencyName(),
				currencyPosition: this.props.instanceConfig.currencyPosition()
			})
		);
	}
});

FreeformEntry.stateFrom = function (document) {
	return {
		meta: {
			timestamp: document.meta.timestamp,
			description: document.meta.description
		},
		transaction: {
			debits: accountArrayFromDict(document.transaction.debets),
			credits: accountArrayFromDict(document.transaction.credits)
		}
	};
};

FreeformEntry.isValidState = function (state) {
	var valid_timestamp = state.meta.timestamp.match(RFC3339);
	var valid_description = state.meta.description.trim() !== "";

	var valid_debits = validate_account_inputs(state.transaction.debits);
	var valid_credits = validate_account_inputs(state.transaction.credits);

	var total_debits = sum_account_inputs(state.transaction.debits);
	var total_credits = sum_account_inputs(state.transaction.credits);
	var valid_sums = total_debits && total_credits && SchemeNumber.fn['='](total_debits, total_credits);

	return valid_timestamp && valid_description && valid_debits && valid_credits && valid_sums;
};

module.exports = FreeformEntry;
