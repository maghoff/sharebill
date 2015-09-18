var React = require('react/addons');
var moment = require('moment');

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
							this.props.format(post.value.transaction.debets[account]));
					}.bind(this));
					var credits = creditAccounts.map(function (account) {
						return React.createElement('td',
							{ key: "credit-" + account, className: "credits currency" },
							this.props.format(post.value.transaction.credits[account]));
					}.bind(this));
					return React.createElement('tr', { key: post.id }, [date, description].concat(debits).concat(credits));
				}.bind(this))
			)
		);
	}
});

module.exports = PostsTable;
