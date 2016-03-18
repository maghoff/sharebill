function (head, req) {
	// !json template.index

	var Mustache = require('vendor/couchapp/lib/mustache');

	start({
		'headers': {
			'Content-Type': 'text/html;charset=utf-8'
		}
	});

	return Mustache.to_html(
		template.index,
		{
			instance_config: JSON.stringify(this.instance_config)
		}
	);
}