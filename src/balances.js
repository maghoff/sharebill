var React = require('react');
var request = require('browser-request');

function format(number) {
	return sharebill.formatCurrencyShort(fractionParser(number));
}

var BalanceRow = React.createClass({
	render: function () {
		if (this.props.value === "0") return null;

		var negative = this.props.value.match(/^-/);
		var debits = "", credits = "";
		if (negative) debits = format(this.props.value.substr(1));
		else credits = format(this.props.value);

		return React.createElement('tr', { className: "accounts" },
			React.createElement('td', null,
				React.createElement('a', { href: "user/" + this.props.user }, this.props.user)
			),
			React.createElement('td', { className: "debets currency" }, debits),
			React.createElement('td', { className: "credits currency" }, credits)
		);
	}
});

var BalancesTable = React.createClass({
	render: function () {
		var balances = this.props.balances.map(function (balance) {
			balance.user = balance.key;
			return React.createElement(BalanceRow, balance);
		});
		return React.createElement('table', { className: "accounts" },
			React.createElement('thead', null,
				React.createElement('tr', null,
					React.createElement('th', null, "Account"),
					React.createElement('th', null, "Debit"),
					React.createElement('th', null, "Credit")
				)
			),
			React.createElement('tbody', null, balances)
		);
	}
});

function initBalances(domNode) {
	React.render(React.createElement(BalancesTable, {balances: []}), domNode);

	request({ url: "balances", json: true }, function (err, response, body) {
		if (err) {
			console.error(err);
			return;
		}

		React.render(
			React.createElement(BalancesTable, {balances: body.rows}),
			domNode
		);
	});
}

function initApp() {
	initBalances(document.getElementById("balances"));
}

function maybeInitApp() {
	if (document.readyState === "complete") {
		initApp();
		return true;
	}
	return false;
}

if (!maybeInitApp()) document.addEventListener("readystatechange", maybeInitApp);
