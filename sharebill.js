var sharebill = (function () {
	var isReady = false;
	var app = null;
	var runOnReady = [];
	var config = {};

	function onReady(callback) {
		if (!isReady) {
			runOnReady.push(callback);
		} else {
			callback(app);
		}
	}

	function ready() {
		isReady = true;
		runOnReady.forEach(function (cb) {
			cb(app);
		});
	}

	$.couch.app(function (newApp) {
		app = newApp;
		app.db.openDoc("instance_config", {
			success: function(json) {
				config = json;
				ready();
			},
			error: function() {
				console.log("This sharebill instance lacks instance_config -- it should be configured! Falling back on default config");

				config = {
					currency_formatting: {
						short: "%(wholepart)d"
					}
				};
				ready();
			}
		});
	});


	function formatCurrencyShort(fraction) {
		fraction = new Fraction(fraction);

		var formatString = config.currency_formatting.short;

		var formatData = {
			decimal: fraction.numerator / fraction.denominator,
			numerator: fraction.numerator,
			denominator: fraction.denominator,
			wholepart: Math.floor(fraction.numerator / fraction.denominator),
			reducedNumerator: fraction.numerator % fraction.denominator
		}

		return sprintf(formatString, formatData);
	}

	function formatCurrencyShortOrEmpty(fraction) {
		if (fraction === undefined) return "";
		fraction = new Fraction(fraction);
		if ((new Fraction(0)).equals(fraction)) return "";
		return formatCurrencyShort(fraction);
	}

	return {
		onReady: onReady,
		formatCurrencyShort: formatCurrencyShort,
		formatCurrencyShortOrEmpty: formatCurrencyShortOrEmpty
	};
}());
