var React = require('react');
var request = require('browser-request');
var moment = require('moment');

function formatSum(sum) {
	var denom = SchemeNumber.fn.denominator(sum);
	if (SchemeNumber.fn["="](denom, new SchemeNumber("1"))) {
		sum_text = sum.toString();
	} else if (SchemeNumber.fn["="](SchemeNumber.fn.lcm(denom, new SchemeNumber("100")), new SchemeNumber("100"))) {
		sum_text = sum.toFixed(2);
	} else {
		sum_text = toMixedNumber(sum);
	}
	return sum_text;
}

function accountArrayFromDict(dict) {
	return Object
		.keys(dict)
		.map(function (key) { return { account: key, value: dict[key] } }.bind(this));
}

function accountDictFromArray(array) {
	var dict = {};
	array.forEach(function (line) {
		if (!line) return;
		dict[line.account] = toMixedNumber(evaluate(line.value));
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

		accounts[entry.account] = (accounts[entry.account] || 0) + 1;
		valid &= (accounts[entry.account] === 1);

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

var AccountInputRow = React.createClass({
	handleChange: function (ev) {
		this.props.set(ev.target.getAttribute("data-for"), ev.target.value);
	},
	handleBlur: function (ev) {
		if (this.props.account === "" && this.props.value === "") {
			this.props.deleteMe();
		}
	},
	render: function () {
		return React.createElement("tr", null,
			React.createElement("td", { className: this.props.type },
				React.createElement("span", { className: "input-prepend control-group" + (this.props.account_error ? " error" : "") },
					React.createElement("span", { className: "add-on" },
						React.createElement("i", { className: "icon-user" })
					),
					React.createElement("input", {
						className: "input-medium account",
						 "data-for": "account",
						 value: this.props.account,
						 title: this.props.account_error,
						 disabled: this.props.enabled ? "" : "disabled",
						 onChange: this.handleChange,
						 onBlur: this.handleBlur
					})
				)
			),
			React.createElement("td", { className: this.props.type + " currency" },
				// TODO Implement support for prefix currencies
				React.createElement("span", { className: "currency_input input-append control-group" + (this.props.value_error ? " error": "") },
					React.createElement("input", {
						className: "input-small currency",
						 "data-for": "value",
						 value: this.props.value,
						 placeholder: this.props.placeholder_value,
						 title: this.props.value_error,
						 disabled: this.props.enabled ? "" : "disabled",
						 onChange: this.handleChange,
						 onBlur: this.handleBlur
					}),
					React.createElement("span", { className: "add-on" }, sharebill.currencyName())
					// TODO ^^^ dependency inject currency information instead of reading from global state
				)
			)
		);
	}
});

var AccountInputTotalRow = React.createClass({
	render: function () {
		return React.createElement("tr", { className: "total" },
			React.createElement("td", { className: this.props.type }, "Sum"),
			React.createElement("td", { className: this.props.type + " currency" }, this.props.value)
		);
	}
});

var AccountInputs = React.createClass({
	set: function (index, key, value) {
		this.props.set(index, key, value);
	},
	deleteRow: function (index) {
		this.props.deleteRow(index);
	},
	render: function () {
		var title = { "debits": "Debits", "credits": "Credits" }[this.props.type];

		var sum = SchemeNumber("0");
		var sum_is_valid = true;
		this.props.values.forEach(function (entry) {
			delete entry.value_error;
			if (entry.value.trim() === "") {
				if (entry.account.trim() !== "") {
					entry.value_error = "Fill in a value";
				}
				return;
			}
			try {
				var value = evaluate(entry.value);
				if (!SchemeNumber.fn['positive?'](value)) entry.value_error = "Values must be positive";
				sum = SchemeNumber.fn['+'](sum, value);
			}
			catch (err) {
				entry.value_error = err.toString();
				sum_is_valid = false;
			}
		});

		var sum_text = "-";
		if (sum_is_valid) sum_text = formatSum(sum);

		var accounts = {};
		this.props.values.forEach(function (entry) {
			accounts[entry.account] = (accounts[entry.account] || 0) + 1;
		});

		return React.createElement("table", { className: "accounts account-inputs" },
			React.createElement("thead", null,
				React.createElement("tr", null,
					React.createElement("th", { colSpan: 2 }, title)
				),
				React.createElement("tr", null,
					React.createElement("th", null, "Account"),
					React.createElement("th", null, "Value")
				)
			),
			React.createElement("tbody", null,
				this.props.values.map(function (item, index) {
					var account_error = null;
					if (item.account === "") account_error = "Fill in account name";
					else if (accounts[item.account] > 1) account_error = "Duplicate account";
					return React.createElement(AccountInputRow, {
						key: index,
						type: this.props.type,
						account: item.account,
						account_error: account_error,
						value: item.value,
						value_error: item.value_error,
						enabled: this.props.enabled,
						set: this.set.bind(this, index),
						deleteMe: this.deleteRow.bind(this, index)
					});
				}.bind(this)).concat([
					React.createElement(AccountInputRow, {
						key: this.props.values.length,
						type: this.props.type,
						account: "",
						value: "",
						placeholder_value: this.props.extra ? formatSum(this.props.extra) : null,
						enabled: this.props.enabled,
						set: this.set.bind(this, this.props.values.length),
						deleteMe: function () {}
					})
				]),
				React.createElement(AccountInputTotalRow, { type: this.props.type, value: sum_text })
			)
		);
	}
});

var FreeformEntry = React.createClass({
	getInitialState: function () {
		return {
			_id: this.props.initialState._id,
			_rev: this.props.initialState._rev,
			meta: {
				timestamp: this.props.initialState.meta.timestamp,
				description: this.props.initialState.meta.description
			},
			transaction: {
				debits: accountArrayFromDict(this.props.initialState.transaction.debets),
				credits: accountArrayFromDict(this.props.initialState.transaction.credits)
			}
		};
	},
	cloneState: function () {
		var state = JSON.parse(JSON.stringify(this.state));
		state.transaction.debits.forEach(function (value, index) { if (value == null) delete state.transaction.debits[index]; });
		state.transaction.credits.forEach(function (value, index) { if (value == null) delete state.transaction.credits[index]; });
		return state;
	},
	handleChange: function (ev) {
		var change = { meta: JSON.parse(JSON.stringify(this.state.meta)) };
		change.meta[ev.target.getAttribute("data-for")] = ev.target.value;
		this.setState(change);
	},
	stateAsDocument: function () {
		return {
			_id: this.state._id,
			_rev: this.state._rev,
			meta: {
				timestamp: this.state.meta.timestamp,
				description: this.state.meta.description
			},
			transaction: {
				debets: accountDictFromArray(this.state.transaction.debits),
				credits: accountDictFromArray(this.state.transaction.credits)
			}
		};
	},
	set: function (accountType, index, property, value) {
		var state = this.cloneState();
		state.transaction[accountType][index] = state.transaction[accountType][index] || { account: "", value: "" };
		state.transaction[accountType][index][property] = value;
		this.setState(state);
	},
	deleteRow: function (accountType, index) {
		var state = this.cloneState();
		delete state.transaction[accountType][index];
		this.setState(state);
	},
	focus: function () {
		this.getDOMNode().querySelector('[data-for="description"]').focus();
	},
	submit: function (valid, ev) {
		ev.preventDefault();
		ev.stopPropagation();

		if (!valid) return;

		this.setState({ saving: true });

		var document = this.stateAsDocument();
		request.put({
			uri: "post/" + document._id,
			json: true,
			body: document
		}, function (err, xhr, body) {
			if (err) {
				this.setState({ saving: false, error: err.toString() });
				return;
			}
			if (body.error) {
				this.setState({ saving: false, error: body.reason });
				return;
			}
			/*this.setState({
				saving: false,
				_id: body.id,
				_rev: body.rev
			});*/
			this.props.deleteMe();
		}.bind(this));
	},
	render: function () {
		var rfc3339 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
		var valid_timestamp = this.state.meta.timestamp.match(rfc3339);
		var valid_description = this.state.meta.description.trim() !== "";

		var valid_debits = validate_account_inputs(this.state.transaction.debits);
		var valid_credits = validate_account_inputs(this.state.transaction.credits);

		var total_debits = sum_account_inputs(this.state.transaction.debits);
		var total_credits = sum_account_inputs(this.state.transaction.credits);
		var valid_sums = total_debits && total_credits && SchemeNumber.fn['='](total_debits, total_credits);

		var valid_form = valid_timestamp && valid_description && valid_debits && valid_credits && valid_sums;

		var missing_debits = null;
		var missing_credits = null;
		if (total_debits && total_credits) {
			if (SchemeNumber.fn['>'](total_debits, total_credits)) missing_credits = SchemeNumber.fn['-'](total_debits, total_credits);
			if (SchemeNumber.fn['>'](total_credits, total_debits)) missing_debits = SchemeNumber.fn['-'](total_credits, total_debits);
		}

		return React.createElement('form',
			{
				onSubmit: this.submit.bind(this, valid_form && !this.state.saving)
			},
			React.createElement("h2", null, "Add a post"),
			React.createElement("dl", null,
				React.createElement("dt", null, "When"),
				React.createElement("dd", { className: "control-group" + (valid_timestamp ? "" : " error") },
					React.createElement("input", {
						value: this.state.meta.timestamp,
						onChange: this.handleChange,
						"data-for": "timestamp",
						disabled: this.state.saving ? "disabled" : ""
					})
				),
				React.createElement("dt", null, "What"),
				React.createElement("dd", { className: "control-group" + (valid_description ? "" : " error") },
					React.createElement("input", {
						value: this.state.meta.description,
						onChange: this.handleChange,
						"data-for": "description",
						disabled: this.state.saving ? "disabled" : ""
					})
				)
			),
			React.createElement(AccountInputs, {
				type: "debits",
				values: this.state.transaction.debits,
				extra: missing_debits,
				set: this.set.bind(this, "debits"),
				deleteRow: this.deleteRow.bind(this, "debits"),
				enabled: !this.state.saving
			}),
			React.createElement(AccountInputs, {
				type: "credits",
				values: this.state.transaction.credits,
				extra: missing_credits,
				set: this.set.bind(this, "credits"),
				deleteRow: this.deleteRow.bind(this, "credits"),
				enabled: !this.state.saving
			}),
			this.state.error ? React.createElement("div", { className: "alert alert-error" }, this.state.error) : "",
			React.createElement("div", null,
				React.createElement("button", {
					className: "btn btn-primary",
					type: "submit",
					disabled: (valid_form && !this.state.saving) ? "" : "disabled"
				}, "Add post"),
				" ",
				React.createElement("button", {
					className: "btn",
					type: "button",
					disabled: this.state.saving ? "disabled" : "",
					onClick: this.props.deleteMe
				}, "Cancel")
			)
		);
	}
});

module.exports = function (domNode, entry, deleteCallback) {
	return React.render(
		React.createElement(
			FreeformEntry, {
				initialState: entry,
				deleteMe: function () {
					React.unmountComponentAtNode(domNode);
					deleteCallback();
				}
			}),
		domNode
	);
};
