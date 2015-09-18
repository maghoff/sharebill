var React = require('react/addons');
var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var fractionParser = require('./views/lib/fractionParser');
var completeEarlyXHR = require('./complete_early_xhr');

var AccountBalance = React.createClass({
	render: function () {
		var credit = "", debit = "", balance = "";

		if (this.props.data) {
			credit = fractionParser(this.props.data.credits);
			debit = fractionParser(this.props.data.debets);
			balance = SchemeNumber.fn["-"](credit, debit);
		}

		return React.createElement(
			"table", { className: "accounts" },
			React.createElement("thead", null,
				React.createElement("tr", null,
					React.createElement("th", null, "What"),
					React.createElement("th", null, "Amount")
				)
			),
			React.createElement("tbody", null,
				React.createElement("tr", null,
					React.createElement("td", { className: "credits" },
						"Credit ",
						React.createElement("a", { className: "fileformat", href: "account/" + this.props.account + "/credit" }, "[txt]")
					),
					React.createElement("td", { className: "credits currency" }, this.props.format(credit))
				),
				React.createElement("tr", null,
					React.createElement("td", { className: "debits" },
						"Debit ",
						React.createElement("a", { className: "fileformat", href: "account/" + this.props.account + "/debit" }, "[txt]")
					),
					React.createElement("td", { className: "debits currency" }, this.props.format(debit))
				),
				React.createElement("tr", null,
					React.createElement("td", { className: "credits" },
						"Balance ",
						React.createElement("a", { className: "fileformat", href: "account/" + this.props.account + "/balance" }, "[txt]")
					),
					React.createElement("td", { className: "currency" }, this.props.format(balance))
				)
			)
		);
	}
});

function format(instanceConfig, value) {
	if (!value) return "";
	if (!instanceConfig.isReady()) return value.toFixed(2);
	return instanceConfig.formatCurrencyShort(value);
}

function initAccountBalance(domNode, xhr, account, instanceConfig) {
	React.render(React.createElement(AccountBalance, { account: account, format: format.bind(this, instanceConfig) }), domNode);

	var data;

	completeEarlyXHR(xhr, function (err, response, body) {
		if (err) {
			console.error(err);
			return;
		}

		data = { credits: "0", debets: "0" };
		body.rows.forEach(function (row) { data[row.key[1]] = row.value; });

		React.render(React.createElement(AccountBalance, { account: account, format: format.bind(this, instanceConfig), data: data }), domNode);
	});

	instanceConfig.whenReady(function () {
		React.render(React.createElement(AccountBalance, { account: account, format: format.bind(this, instanceConfig), data: data }), domNode);
	});
};

initAccountBalance.AccountBalance = AccountBalance;
module.exports = initAccountBalance;
