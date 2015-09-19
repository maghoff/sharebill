function (head, req) {
	// !json template.account
	var Mustache = require('vendor/couchapp/lib/mustache');

	var moment = require('moment');
	require('lib/moment-config');

	// Avoid rendering relative times on the server. The
	// resulting html may be cached for a long time.
	moment.locale('lokale', {
		relativeTime: {
			future: "",
			past:   "",
			s:  "",
			m:  "",
			mm: "",
			h:  "",
			hh: "",
			d:  "",
			dd: "",
			M:  "",
			MM: "",
			y:  "",
			yy: ""
		}
	});

	var React = require('react/addons');
	var AccountBalance = require('lib/account-balance').AccountBalance;
	var PostsTable = require('lib/posts-table');
	var SchemeNumber = require('lib/views/lib/schemeNumber').SchemeNumber;
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
				format: function (value) { return value ? SchemeNumber.fn.floor(fractionParser(value)).toFixed(0) : ""; }
			}
		)
	);

	start({
        'headers': {
            'Content-Type': 'text/html;charset=utf-8'
        }
    });
	return Mustache.to_html(
		template.account,
		{
			account: account,
			balance: balance,
			posts: posts,
			list: JSON.stringify(list)
		}
	);
}
