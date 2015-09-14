function(doc, req) {
	if (!doc) return { code: 404, body: "Not found" };

	// !json template.freeform
	var Mustache = require('vendor/couchapp/lib/mustache');

	return Mustache.to_html(template.freeform, { document: JSON.stringify(doc) });
}
