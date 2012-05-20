function (head, req) {
	var Fraction = require("views/lib/fraction").Fraction;

	provides("text", function() {
		var sum = new Fraction(0);

		var row;
		while (row = getRow()) {
			var accountTypeFactor = (row.key[1] === "credits" ? 1 : -1);
			var value = new Fraction(row.value);
			var weightedValue = value.multiply(accountTypeFactor);
			sum = sum.add(weightedValue);
		}

		return (sum.numerator / sum.denominator).toFixed(2);
	});
}
