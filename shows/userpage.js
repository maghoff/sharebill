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
				reduce: false,
				descending: true,
				startkey: [ user, {} ],
				endkey: [ user ],
				limit: 10
			}
		));

	return Mustache.to_html(template.user, req.query);
}
