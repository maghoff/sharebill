var React = require('react');
var PostsTable = require('./posts-table');
var fractionParser = require('./views/lib/fractionParser');

module.exports = function (dom, posts, instanceConfig) {
	React.render(
		React.createElement(
			PostsTable,
			{
				posts: posts,
				format: function (value) {
					if (!value) return "";
					return instanceConfig.formatCurrencyShort(fractionParser(value));
				}
			}
		),
		document.getElementById('posts')
	);
};
