function (head, req) {
	var Mustache = require('mustache');

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
	var InstanceConfig = require('lib/instance-config');

	var instanceConfig = new InstanceConfig(this.instance_config);

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
				format: function (value) {
					if (!value) return "";
					return instanceConfig.formatCurrencyShort(fractionParser(value));
				}
			}
		)
	);

	start({
        'headers': {
            'Content-Type': 'text/html;charset=utf-8'
        }
    });
	return Mustache.to_html(
		this.template.account,
		{
			cfg: this.instance_config,
			sums: this.sums,
			account: account,
			balance: balance,
			posts: posts,
			list: JSON.stringify(list),
			instance_config: JSON.stringify(this.instance_config)
		}
	);
}
