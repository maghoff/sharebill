var completeEarlyXHR = require('./complete_early_xhr');
var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var sprintf = require('sprintf-js').sprintf;

function InstanceConfig() {
	this.config = null;
	this.listeners = [];
}

InstanceConfig.prototype.setConfig = function (config) {
	this.config = config;
	this.listeners.forEach(function (listener) { listener() });
};

InstanceConfig.prototype.isReady = function () {
	return !!this.config;
};

InstanceConfig.prototype.whenReady = function (listener) {
	this.listeners.push(listener);
	if (this.isReady()) listener();
};

InstanceConfig.prototype.formatCurrencyShort = function (fraction) {
	var formatString = this.config.currency_formatting.short;

	var formatData = {
		decimal: SchemeNumber.fn.inexact(fraction) + 0,
		numerator: SchemeNumber.fn.numerator(fraction) + 0,
		denominator: SchemeNumber.fn.denominator(fraction) + 0,
		wholepart: SchemeNumber.fn.floor(fraction) + 0,
		reducedNumerator: SchemeNumber.fn.mod(SchemeNumber.fn.numerator(fraction), SchemeNumber.fn.denominator(fraction)) + 0
	};

	return sprintf(formatString, formatData);
};

InstanceConfig.prototype.formatCurrencyShortOrEmpty = function (fraction) {
	if (fraction === undefined) return "";
	if (typeof fraction === "string") fraction = fractionParser(fraction);
	if (SchemeNumber.fn["zero?"](fraction)) return "";
	return formatCurrencyShort(fraction);
};

InstanceConfig.prototype.currencyName = function () {
	return this.config.currency_formatting.currency;
};

InstanceConfig.prototype.currencyPosition = function () {
	return this.config.currency_formatting.currency_position;
};

module.exports = function (xhr) {
	var instanceConfig = new InstanceConfig();

	completeEarlyXHR(xhr, function (err, httpResponse, body) {
		if (err) {
			console.warn("This sharebill instance lacks instance_config -- it should be configured! Falling back on default config");

			instanceConfig.setConfig({
				currency_formatting: {
					short: "%(wholepart)d",
					currency: "kr",
					currency_position: "suffix"
				}
			});
			return;
		}

		instanceConfig.setConfig(body);
	});

	return instanceConfig;
}
