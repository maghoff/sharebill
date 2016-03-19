function (head, req) {
	var Mustache = require('vendor/couchapp/lib/mustache');
	var React = require('react/addons');
	var PostsTable = require('lib/posts-table');
	var fractionParser = require('lib/views/lib/fractionParser');
	var InstanceConfig = require('lib/instance-config');

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

	start({
		'headers': {
			'Content-Type': 'text/html;charset=utf-8'
		}
	});

	var instanceConfig = new InstanceConfig(this.instance_config);

	var row;
	var rows = [];
	while (row = getRow()) {
		rows.push(row);
	}

	var recent_rendered = React.renderToString(
		React.createElement(PostsTable, {
			posts: rows,
			format: function format(number) {
				if (number === undefined) return "";
				return instanceConfig.formatCurrencyShort(fractionParser(number));
			}
		})
	);

	return Mustache.to_html(
		this.template.index,
		{
			instance_config: JSON.stringify(this.instance_config),
			recent_rendered: recent_rendered,
			recent: JSON.stringify({
				update_seq: req.info.update_seq,
				rows: rows
			})
		}
	);
}
