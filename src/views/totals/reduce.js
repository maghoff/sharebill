function(key, values) {
	// !code views/lib/fraction.js

	var total = new Fraction(0);

	values.forEach(function (x) {
		var y = new Fraction(x);
	    total = total.add(y);
	});

    return total.toString();
}
