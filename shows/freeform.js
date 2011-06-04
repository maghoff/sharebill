function(doc, req) {
	// !json template.freeform
	var Mustache = require('vendor/couchapp/lib/mustache');
	return Mustache.to_html(template.freeform, doc);
}
