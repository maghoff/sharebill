var fractionParser = require('./views/lib/fractionParser');
var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;

function InstanceConfig(config) {
	if (!(this instanceof InstanceConfig)) return new InstanceConfig(config);
	this.config = config;
}

InstanceConfig.prototype.formatCurrencyShort = function (fraction) {
	return fraction.toFixed(this.config.currency_formatting.short.decimals);
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

module.exports = InstanceConfig;
