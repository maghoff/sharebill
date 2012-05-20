function(doc, req) {
	// !json template.freeform
	var Mustache = require('vendor/couchapp/lib/mustache');

	var make_dict_array = function(d) {
		var arr = [];
		for (var key in d) {
			arr.push({key: key, value: d[key]});
		}
		return arr;
	};

	doc.transaction.debit_array = make_dict_array(doc.transaction.debets);
	doc.transaction.credit_array = make_dict_array(doc.transaction.credits);

	doc.a = make_dict_array(doc._attachments);

	return Mustache.to_html(template.freeform, doc);
}
