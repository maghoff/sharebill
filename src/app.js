var initInstanceConfig = require('./instance_config');
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
	var instance_config = initInstanceConfig(early_xhrs.instance_config);
	initBalances(document.getElementById("balances"), early_xhrs.balances, instance_config);
	initRecent(document.getElementById("recent"), early_xhrs.recent, instance_config);
	initEntryButtons(document.getElementById("entry-buttons"), document.getElementById("entry"), instance_config);
}

function maybeInitApp() {
	if (document.readyState === "complete") {
		initApp();
		return true;
	}
	return false;
}

if (!maybeInitApp()) document.addEventListener("readystatechange", maybeInitApp);
