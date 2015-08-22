function(key, values) {

	// !code views/lib/biginteger.js
	(function () { this.BigInteger = BigInteger; })();

	// !code views/lib/schemeNumber.js
	// !code views/lib/fractionParser.js

	var total = new SchemeNumber("0");

	values.forEach(function (x) {
		total = SchemeNumber.fn['+'](total, fractionParser(x));
	});

	return total.toString();
}
