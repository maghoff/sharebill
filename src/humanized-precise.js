var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var toMixedNumber = require('./toMixedNumber');

module.exports = function (num) {
	var denom = SchemeNumber.fn.denominator(num);
	if (SchemeNumber.fn["="](denom, new SchemeNumber("1"))) {
		return num.toString();
	} else if (SchemeNumber.fn["="](SchemeNumber.fn.lcm(denom, new SchemeNumber("100")), new SchemeNumber("100"))) {
		return num.toFixed(2);
	} else {
		return toMixedNumber(num);
	}
};
