var React = require('react');
var completeEarlyXHR = require('./complete_early_xhr');
var fractionParser = require('./views/lib/fractionParser.js');

var BalanceRow = React.createClass({
	render: function () {
		var negative = this.props.value.match(/^-/);
		var debits = "", credits = "";
		if (negative) debits = this.props.format(this.props.value.substr(1));
		else credits = this.props.format(this.props.value);

		return React.createElement('tr', { className: "accounts" },
			React.createElement('td', null,
				React.createElement('a', { href: "user/" + this.props.user }, this.props.user)
			),
			React.createElement('td', { className: "debits currency" }, debits),
			React.createElement('td', { className: "credits currency" }, credits)
		);
	}
});

var BalancesTable = React.createClass({
	getInitialState: function () {
		return {
			balances: [],
			format: function () { return ''; }
		};
	},
	render: function () {
		var balances = this.state.balances.filter(function (balance) {
			return balance.value !== "0";
		}).map(function (balance) {
			balance.user = balance.key;
			balance.format = this.state.format;
			return React.createElement(BalanceRow, balance);
		}.bind(this));
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

module.exports = function (domNode, xhr, instanceConfig) {
	var balances = React.render(React.createElement(BalancesTable, null), domNode);

	completeEarlyXHR(xhr, function (err, response, body) {
		if (err) {
			console.error(err);
			return;
		}

		balances.setState({ balances: body.rows });
	});

	instanceConfig.whenReady(function () {
		balances.setState({
			format: function (number) {
				return instanceConfig.formatCurrencyShort(fractionParser(number));
			}
		});
	});
};
