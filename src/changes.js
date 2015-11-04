var INITIAL_BACKOFF_INTERVAL = 500;

function Changes(components) {
	this.lastSeq = null;
	this.backoffInterval = INITIAL_BACKOFF_INTERVAL;
	this.listeners = components.map(function (x) { return x.poll.bind(x); });

	var lastSeq = Infinity, outstanding = 0;

	var maybePoll = function () {
		if (outstanding === 0) {
			this.lastSeq = lastSeq;
			this.poll();
		}
	}.bind(this);

	components.forEach(function (component) {
		if (component.updateSeq) lastSeq = Math.min(lastSeq, component.updateSeq);
		else {
			outstanding++;
			component.updateSeqListener = function (updateSeq) {
				lastSeq = Math.min(lastSeq, updateSeq);
				outstanding--;
				maybePoll();
			}
		}
	});

	maybePoll();
}

Changes.prototype.listen = function (listener) {
	this.listeners.push(listener);
};

Changes.prototype.loadHandler = function () {
	if (this.xhr.status >= 400) {
		console.error("Unexpected status code from polling the changes feed:", this.xhr.status);
		return this.retry();
	}

	try {
		var changes = JSON.parse(this.xhr.responseText);
		this.lastSeq = changes.last_seq;
		if (changes.results.length) {
			this.listeners.forEach(function (listener) {
				try {
					listener();
				}
				catch (err) {
					console.error("When calling", listener, "from Changes,", err);
				}
			});
		}
	}
	catch (err) {
		// If the longpoll times out on a proxy server, we might not get
		// a sensible reply. In this case it is A-OK to ignore the error.
	}

	this.xhr = null;
	this.backoffInterval = INITIAL_BACKOFF_INTERVAL;

	this.poll();
};

Changes.prototype.errorHandler = function (ev) {
	console.error("Error while polling for changes,", ev);
	this.retry();
};

Changes.prototype.abortHandler = function (ev) {
	console.error("Polling for changes was aborted,", ev);
	this.retry();
};

Changes.prototype.retry = function () {
	this.xhr = null;
	setTimeout(this.poll.bind(this), this.backoffInterval);
	this.backoffInterval = Math.max(this.backoffInterval * 2, 10000);
};

Changes.prototype.poll = function () {
	if (this.xhr) throw new Error("Changes.poll called when poll already in progress");

	this.xhr = new XMLHttpRequest();
	this.xhr.onload = this.loadHandler.bind(this);
	this.xhr.onerror = this.errorHandler.bind(this);
	this.xhr.onabort = this.abortHandler.bind(this);
	this.xhr.open("GET", "changes?feed=longpoll&since=" + encodeURIComponent(this.lastSeq));
	this.xhr.send();
};

Changes.prototype.initPoll = function (lastSeq) {
	this.lastSeq = lastSeq;
	this.poll();
};

module.exports = Changes;
