var initBalances = require('./balances');
var initRecent = require('./recent');

function initApp() {
	initBalances(document.getElementById("balances"));
	initRecent(document.getElementById("recent"));
}

function maybeInitApp() {
	if (document.readyState === "complete") {
		initApp();
		return true;
	}
	return false;
}

if (!maybeInitApp()) document.addEventListener("readystatechange", maybeInitApp);
