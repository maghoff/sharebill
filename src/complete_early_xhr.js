function maybeFinished(xhr, callback) {
	if (xhr.readyState === XMLHttpRequest.DONE) {
		var err = null;
		if (xhr.status < 200 || xhr.status >= 300) err = { "error": xhr.status };
		callback(err, xhr, xhr.response);
		return true;
	}
	return false;
}

module.exports = function (xhr, callback) {
	if (maybeFinished(xhr, callback)) return;
	xhr.addEventListener("readystatechange", maybeFinished.bind(this, xhr, callback));
};
