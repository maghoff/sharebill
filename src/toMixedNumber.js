if (typeof require !== 'undefined') SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;

function toMixedNumber(num) {
	var floor = SchemeNumber.fn.floor(num);
	var rest = SchemeNumber.fn['-'](num, floor);
	var parts = [];
	if (!SchemeNumber.fn['zero?'](floor)) parts.push(floor.toString());
	if (!SchemeNumber.fn['zero?'](rest)) parts.push(rest.toString());
	if (!parts.length) parts.push('0');
	return parts.join(' ');
}

if (typeof exports !== 'undefined') module.exports = toMixedNumber;
