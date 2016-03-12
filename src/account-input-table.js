var React = require('react/addons');
var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var evaluate = require('./calc');
var toMixedNumber = require('./toMixedNumber');

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
		var input = React.createElement("input", {
			className: "input-small currency",
			"data-for": "value",
			value: this.props.value,
			placeholder: this.props.placeholder_value,
			title: this.props.value_error,
			disabled: this.props.enabled ? "" : "disabled",
			onChange: this.handleChange,
			onBlur: this.handleBlur
		});

		var currency = React.createElement("span", { className: "add-on" }, this.props.currencyName);

		var inputClass = (this.props.currencyPosition === "prefix" ? "input-prepend" : "input-append");
		var inputElements = (this.props.currencyPosition === "prefix" ? [ currency, input ] : [ input, currency ]);

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
				React.createElement(
					"span",
					{
						className: [
							"currency_input",
							"control-group",
							inputClass,
						].concat(this.props.value_error ? ["error"]: [])
						.join(' ')
					},
					inputElements
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

var AccountInputTable = React.createClass({
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
			accounts[entry.account.trim()] = (accounts[entry.account.trim()] || 0) + 1;
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
			React.createElement(React.addons.CSSTransitionGroup, { transitionName: "account-row", component: "tbody" },
				this.props.values.map(function (item, index) {
					var account_error = null;
					if (item.account.trim() === "") account_error = "Fill in account name";
					else if (accounts[item.account.trim()] > 1) account_error = "Duplicate account";
					return React.createElement(AccountInputRow, {
						key: index,
						type: this.props.type,
						account: item.account,
						account_error: account_error,
						value: item.value,
						value_error: item.value_error,
						currencyName: this.props.currencyName,
						currencyPosition: this.props.currencyPosition,
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
						currencyName: this.props.currencyName,
						currencyPosition: this.props.currencyPosition,
						placeholder_value: this.props.extra ? formatSum(this.props.extra) : null,
						enabled: this.props.enabled,
						set: this.set.bind(this, this.props.values.length),
						deleteMe: function () {}
					}),
					React.createElement(AccountInputTotalRow, { key: "sum", type: this.props.type, value: sum_text })
				])
			)
		);
	}
});

module.exports = AccountInputTable;
