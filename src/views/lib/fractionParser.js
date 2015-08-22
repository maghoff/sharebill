if (typeof SchemeNumber === 'undefined') SchemeNumber = require("./schemeNumber").SchemeNumber;

function fractionParser(num) {
	var fractionPattern = /^((\d+)|(\d+\/\d+)|((\d+) (\d+\/\d+)))$/;

	if (typeof num === "number") num = "" + num;
	if (typeof num !== "string") throw new Error("num not a string, but a '" + typeof num + "': " + JSON.stringify(num));
	var parts = num.match(fractionPattern);
	if (!parts) throw new Error("Attempted to parse an invalid number/fraction: " + num);

	var value = new SchemeNumber("0");
	if (parts[2]) value = SchemeNumber.fn['+'](value, new SchemeNumber(parts[2]));
	if (parts[3]) value = SchemeNumber.fn['+'](value, new SchemeNumber(parts[3]));
	if (parts[5]) value = SchemeNumber.fn['+'](value, new SchemeNumber(parts[5]));
	if (parts[6]) value = SchemeNumber.fn['+'](value, new SchemeNumber(parts[6]));
	return value;
}

if (typeof exports !== 'undefined') {
	exports.fractionParser = fractionParser;
}
