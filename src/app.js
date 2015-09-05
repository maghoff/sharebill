var initBalances = require('./balances');
var initRecent = require('./recent');
var initEntryButtons = require('./entry-buttons');

var moment = require('moment');
require('moment/locale/en-gb');
moment.locale('en-gb', {
	relativeTime: {
		future: "in %s",
		past:   "%s ago",
		s:  "seconds",
		m:  "a minute",
		mm: "%d minutes",
		h:  "an hour",
		hh: "%d hours",
		d:  "a day",
		dd: "%d days",
		M:  "a month",
		MM: "%d months",
		y:  "a year",
		yy: "%d years"
	}
});

function initApp() {
	initBalances(document.getElementById("balances"));
	initRecent(document.getElementById("recent"));
	initEntryButtons(document.getElementById("entry-buttons"), document.getElementById("entry"));
}

function maybeInitApp() {
	if (document.readyState === "complete") {
		initApp();
		return true;
	}
	return false;
}

if (!maybeInitApp()) document.addEventListener("readystatechange", maybeInitApp);
