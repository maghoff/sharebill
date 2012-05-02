var sharebill = (function () {
	var isReady = false;
	var app = null;
	var runOnReady = [];
	var instance_config = null;

	function onReady(callback, config) {
		if (!isReady) {
			runOnReady.push(callback);
		} else {
			callback.call(app, app);
		}
	}

	function ready() {
		console.log(app);
		isReady = true;
		runOnReady.forEach(function (cb) {
			cb.call(app, app);
		});
	}

	$.couch.app(function (newApp) {
		app = newApp;
		app.db.openDoc("instance_config", {
			success: function(json) {
				instance_config = json;
				ready();
			},
			error: function() {
				console.log("This sharebill instance lacks instance_config -- it should be configured! Falling back on default config");

				instance_config = {
					currency_formatting: {
						short: "%(wholepart)d"
					}
				};
				ready();
			}
		});
	}, config);

	function formatCurrencyShort(fraction) {
		fraction = new Fraction(fraction);

		var formatString = instance_config.currency_formatting.short;

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
