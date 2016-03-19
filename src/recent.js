var React = require('react');
var request = require('browser-request');
var completeEarlyXHR = require('./complete_early_xhr');
var fractionParser = require('./views/lib/fractionParser');
var PostsTable = require('./posts-table');

function format(instanceConfig, number) {
	if (number === undefined) return "";
	return instanceConfig.formatCurrencyShort(fractionParser(number));
}

function RecentComponent(domNode, data, instanceConfig) {
	if (!(this instanceof RecentComponent)) return new RecentComponent(domNode, instanceConfig);

	this.domNode = domNode;
	this.data = data;
	this.instanceConfig = instanceConfig;
	this.pendingUpdate = null;

	this.render();
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

function Recent(domNode, url, data, instanceConfig) {
	this.domNode = domNode;
	this.url = url;
	this.instanceConfig = instanceConfig;

	this.handleResponse(null, null, data);
}

Recent.prototype.handleResponse = function (err, response, body) {
	if (err) {
		console.error(err);
		return;
	}

	this.updateSeq = body.update_seq;

	body.rows.reverse();

	if (this.component) this.component.setData(body.rows);
	else this.component = new RecentComponent(this.domNode, body.rows, this.instanceConfig);
};

Recent.prototype.poll = function () {
	request.get({ uri: this.url, json: true }, this.handleResponse.bind(this));
};

module.exports = function (domNode, url, xhr, instanceConfig) {
	return new Recent(domNode, url, xhr, instanceConfig);
};
