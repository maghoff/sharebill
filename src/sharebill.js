var sharebill = (function () {
	var isReady = false;
	var runOnReady = [];
	var app = null;
	var instance_config = null;
	var accounts = null;

	function onReady(callback, config) {
		if (!isReady) {
			runOnReady.push(callback);
		} else {
			callback.call(app, app);
		}
	}

	function ready() {
		runOnReady.forEach(function (cb) {
			cb.call(app, app);
		});
	}

	function maybeReady() {
		isReady = (instance_config !== null) && (app !== null) && (accounts !== null);
		if (isReady) ready();
	}

	function getdb(opts) {
		var urlPrefix = opts.urlPrefix || "";

		var index = urlPrefix.split('/').length;
		var fragments = unescape(document.location.href).split('/');
		var dbname = opts.db || fragments[index + 2];
		var dname = opts.design || fragments[index + 4];

		return [$.couch.db(dbname), dname];
	}

	var dbInfo = getdb(config);
	var db = dbInfo[0];
	var dname = dbInfo[1];

	db.openDoc("instance_config", {
		success: function(json) {
			instance_config = json;
			maybeReady();
		},
		error: function() {
			console.log("This sharebill instance lacks instance_config -- it should be configured! Falling back on default config");

			instance_config = {
				currency_formatting: {
					short: "%(wholepart)d",
					currency: "kr",
					currency_position: "suffix"
				}
			};
			maybeReady();
		}
	});

	db.view(dname + "/totals", {
		group_level: 1,
		success: function(json) {
			accounts = json.rows.map(function (row) { return row.key[0]; });
			maybeReady();
		}
	});

	$.couch.app(function (newApp) {
		app = newApp;
		maybeReady();
	}, config);

	function formatCurrencyShort(fraction) {
		var formatString = instance_config.currency_formatting.short;

		var formatData = {
			decimal: SchemeNumber.fn.inexact(fraction) + 0,
			numerator: SchemeNumber.fn.numerator(fraction) + 0,
			denominator: SchemeNumber.fn.denominator(fraction) + 0,
			wholepart: SchemeNumber.fn.floor(fraction) + 0,
			reducedNumerator: SchemeNumber.fn.mod(SchemeNumber.fn.numerator(fraction), SchemeNumber.fn.denominator(fraction)) + 0
		};

		return sprintf(formatString, formatData);
	}

	function formatCurrencyShortOrEmpty(fraction) {
		if (fraction === undefined) return "";
		if (typeof fraction === "string") fraction = fractionParser(fraction);
		if (SchemeNumber.fn["zero?"](fraction)) return "";
		return formatCurrencyShort(fraction);
	}

	function currencyName() {
		return instance_config.currency_formatting.currency;
	}

	function currencyPosition() {
		return instance_config.currency_formatting.currency_position;
	}

	return {
		onReady: onReady,
		formatCurrencyShort: formatCurrencyShort,
		formatCurrencyShortOrEmpty: formatCurrencyShortOrEmpty,
		currencyName: currencyName,
		currencyPosition: currencyPosition,
		allAccounts: function () { return accounts; }
	};
}());
