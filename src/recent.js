var React = require('react');
var request = require('browser-request');
var moment = require('moment');

function format(number) {
	if (number === undefined) return "";
	return sharebill.formatCurrencyShort(fractionParser(number));
}

var PostsTable = React.createClass({
	render: function () {
		var debitAccounts = [];
		var creditAccounts = [];

		function insertSorted(arr, item) {
			var i = 0;
			while ((i < arr.length) && (item > arr[i])) {
				i++;
			}
			if (arr[i] === item) return;
			arr.splice(i, 0, item);
		}

		this.props.posts.forEach(function (post) {
			for (var accountName in post.value.transaction.debets) insertSorted(debitAccounts, accountName);
			for (var accountName in post.value.transaction.credits) insertSorted(creditAccounts, accountName);
		});

		return React.createElement('table', { className: "accounts" },
			React.createElement('thead', null,
				React.createElement('tr', null,
					React.createElement('th', { rowSpan: 2 }, "When"),
					React.createElement('th', { rowSpan: 2 }, "What"),
					React.createElement('th', { colSpan: debitAccounts.length, className: "user_super_header" }, "Debit"),
					React.createElement('th', { colSpan: creditAccounts.length, className: "user_super_header" }, "Credit")
				),
				React.createElement('tr', null,
					debitAccounts.map(function (account) { return React.createElement('th', { key: account }, account); }),
					creditAccounts.map(function (account) { return React.createElement('th', { key: account }, account); })
				)
			),
			React.createElement('tbody', null,
				this.props.posts.map(function (post) {
					var timestamp = moment(post.value.meta.timestamp);
					var date = React.createElement('td', { key: "date", title: timestamp.calendar(), className: "date" }, timestamp.fromNow());
					var description = React.createElement('td', { key: "description" },
						React.createElement('a', { href: "post/"+post.id }, post.value.meta.description));
					var debits = debitAccounts.map(function (account) {
						return React.createElement('td',
							{ key: "debit-" + account, className: "debits currency" },
							format(post.value.transaction.debets[account]));
					});
					var credits = creditAccounts.map(function (account) {
						return React.createElement('td',
							{ key: "credit-" + account, className: "credits currency" },
							format(post.value.transaction.credits[account]));
					});
					return React.createElement('tr', { key: post.id }, [date, description].concat(debits).concat(credits));
				})
			)
		);
	}
});

function RecentComponent(domNode) {
	if (!(this instanceof RecentComponent)) return new RecentComponent(domNode);

	this.domNode = domNode;
	this.data = [];
	this.pendingUpdate = null;

	this.render();
}

RecentComponent.prototype.setData = function (data) {
	this.data = data;
	this.render();
};

RecentComponent.prototype.render = function () {
	React.render(React.createElement(PostsTable, {posts: this.data}), this.domNode);
	this.updateTimestamps();
};

RecentComponent.prototype.msToNextUpdate = function () {
	if (!this.data) return null;
	return 15000;
};

RecentComponent.prototype.updateTimestamps = function () {
	if (this.pendingUpdate) return;

	var msToNextUpdate = this.msToNextUpdate();
	if (msToNextUpdate == null) return;

	this.pendingUpdate = setTimeout(function () {
		// Use requestAnimationFrame to avoid updating in a background tab
		this.pendingUpdate = requestAnimationFrame(function () {
			this.pendingUpdate = null;
			this.render();
		}.bind(this));
	}.bind(this), msToNextUpdate);
}

module.exports = function (domNode) {
	var recentComponent = new RecentComponent(domNode);

	request({ url: "recent", json: true }, function (err, response, body) {
		if (err) {
			console.error(err);
			return;
		}

		body.rows.reverse();

		recentComponent.setData(body.rows);
	});
};
