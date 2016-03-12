var React = require('react');
var request = require('browser-request');
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
				React.createElement('a', { href: "account/" + this.props.user }, this.props.user)
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
		};
	},
	render: function () {
		var balances = this.state.balances.filter(function (balance) {
			return balance.value !== "0";
		}).map(function (balance) {
			balance.user = balance.key;
			balance.format = this.props.format;
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

function Balances(domNode, url, earlyXhr, instanceConfig) {
	this.url = url;

	this.component = React.render(
		React.createElement(BalancesTable, {
			format: function (number) {
				return instanceConfig.formatCurrencyShort(fractionParser(number));
			}
		}),
		domNode
	);

	completeEarlyXHR(earlyXhr, function (err, response, body) {
		this.handleResponse(err, response, body);
		if (this.updateSeqListener) this.updateSeqListener(this.updateSeq);
	}.bind(this));
}

Balances.prototype.handleResponse = function (err, response, body) {
	if (err) {
		console.error(err);
		return;
	}

	this.updateSeq = body.update_seq || Infinity;

	this.component.setState({ balances: body.rows });
};

Balances.prototype.poll = function () {
	request.get({ uri: this.url, json: true }, this.handleResponse.bind(this));
};

module.exports = function (domNode, url, xhr, instanceConfig) {
	return new Balances(domNode, url, xhr, instanceConfig);
};
