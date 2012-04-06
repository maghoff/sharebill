function () {
	var pairs = window.location.search.substr(1).split('&').map(function (x) { return x.split('='); });
	var d = {};
	pairs.forEach(function (pair) {
		d[pair[0]] = pair[1];
	});
	return d;
}
