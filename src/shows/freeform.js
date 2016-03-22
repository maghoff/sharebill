function(doc, req) {
	if (!doc) return { code: 404, body: "Not found" };

	var Mustache = require('vendor/couchapp/lib/mustache');

	var React = require('react/addons');
	var PostEditor = require('lib/post-editor').PostEditor;
	var InstanceConfig = require('lib/instance-config');

	var instanceConfig = new InstanceConfig(this.instance_config);

	var post = React.renderToString(
		React.createElement(
			PostEditor, {
				document: doc,
				deleteMe: function () {},
				didSave: function () {},
				instanceConfig: instanceConfig
			}
		)
	);

	return Mustache.to_html(
		this.template.freeform,
		{
			cdn_base: this.instance_config.cdn_base,
			all_css_sum: this.sums.all_css_sum,
			all_js_sum: this.sums.all_js_sum,
			document: JSON.stringify(doc),
			instance_config: JSON.stringify(this.instance_config),
			form: post
		}
	);
}
