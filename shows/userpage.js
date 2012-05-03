function(doc, req) {
	// !json template.user
	var Mustache = require('vendor/couchapp/lib/mustache');
	var path = require('vendor/couchapp/lib/path').init(req);

	var user = req.query.user;

	req.query["atom-uri"] =
		path.absolute(path.list(
			"account_posts",
			"user",
			{
				descending: true,
				startkey: [ user, {} ],
				endkey: [ user ],
				limit: 10
			}
		));

	req.query["credit-uri"] =
		path.absolute(path.list(
			"balance",
			"totals",
			{
				group: true,
				keys: JSON.stringify([[user, "credits"]])
			}
		));

	req.query["debit-uri"] =
		path.absolute(path.list(
			"balance",
			"totals",
			{
				group: true,
				keys: JSON.stringify([[user, "debets"]])
			}
		));

	req.query["balance-uri"] =
		path.absolute(path.list(
			"balance",
			"totals",
			{
				group: true,
				startkey: [ user, "credits" ],
				endkey: [ user, "debets" ]
			}
		));

	return Mustache.to_html(template.user, req.query);
}
