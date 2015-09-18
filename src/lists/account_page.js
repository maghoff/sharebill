function (head, req) {
	// !json template.user
	var Mustache = require('vendor/couchapp/lib/mustache');

	require('lib/moment-config');
	var React = require('react/addons');
	var AccountBalance = require('lib/account-balance').AccountBalance;
	var PostsTable = require('lib/posts-table');
	var fractionParser = require('lib/views/lib/fractionParser');

	var row;
	var list = [];
	while (row = getRow()) {
		list.push(row);
	}
	list.reverse();

	var account = req.query.uid;

	var balance = React.renderToString(
		React.createElement(
			AccountBalance,
			{
				account: account,
				format: function () { return ""; }
			}
		)
	);

	var posts = React.renderToString(
		React.createElement(
			PostsTable,
			{
				posts: list,
				format: function (value) { return value ? fractionParser(value).toFixed(0) : ""; }
			}
		)
	);

	start({
        'headers': {
            'Content-Type': 'text/html;charset=utf-8'
        }
    });
	return Mustache.to_html(
		template.user,
		{
			account: account,
			balance: balance,
			posts: posts,
			list: JSON.stringify(list)
		}
	);
}
