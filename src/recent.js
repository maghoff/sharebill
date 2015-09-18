var React = require('react');
var completeEarlyXHR = require('./complete_early_xhr');
var fractionParser = require('./views/lib/fractionParser');
var PostsTable = require('./posts-table');

function format(instanceConfig, number) {
	if (!instanceConfig.isReady()) return "";
	if (number === undefined) return "";
	return instanceConfig.formatCurrencyShort(fractionParser(number));
}

function RecentComponent(domNode, instanceConfig) {
	if (!(this instanceof RecentComponent)) return new RecentComponent(domNode, instanceConfig);

	this.domNode = domNode;
	this.data = [];
	this.instanceConfig = instanceConfig;
	this.pendingUpdate = null;

	this.render();
	if (!this.instanceConfig.isReady()) this.instanceConfig.whenReady(this.render.bind(this));
}

RecentComponent.prototype.setData = function (data) {
	this.data = data;
	this.render();
};

RecentComponent.prototype.render = function () {
	React.render(
		React.createElement(PostsTable, {
			posts: this.data,
			format: format.bind(this, this.instanceConfig)
		}),
		this.domNode
	);
	this.updateTimestamps();
};

RecentComponent.prototype.msToNextUpdate = function () {
	if (!this.data) return null;
	return 15000;
};

RecentComponent.prototype.updateTimestamps = function () {
	if (this.pendingUpdate) return;

	var msToNextUpdate = this.msToNextUpdate();
	if (msToNextUpdate == null) return;

	this.pendingUpdate = setTimeout(function () {
		// Use requestAnimationFrame to avoid updating in a background tab
		this.pendingUpdate = requestAnimationFrame(function () {
			this.pendingUpdate = null;
			this.render();
		}.bind(this));
	}.bind(this), msToNextUpdate);
}

module.exports = function (domNode, xhr, instanceConfig) {
	var recentComponent = new RecentComponent(domNode, instanceConfig);

	completeEarlyXHR(xhr, function (err, response, body) {
		if (err) {
			console.error(err);
			return;
		}

		body.rows.reverse();

		recentComponent.setData(body.rows);
	});
};
