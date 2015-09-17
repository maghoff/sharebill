function (head, req) {
	var SchemeNumber = require("views/lib/schemeNumber").SchemeNumber;
	var fractionParser = require("views/lib/fractionParser");

	var POS = new SchemeNumber("1"), NEG = new SchemeNumber("-1");

	provides("text", function() {
		var sum = new SchemeNumber("0");

		var row;
		while (row = getRow()) {
			var accountTypeFactor = (row.key[1] === "credits" ? POS : NEG);
			var value = fractionParser(row.value);
			var weightedValue = SchemeNumber.fn["*"](value, accountTypeFactor);
			sum = SchemeNumber.fn["+"](sum, weightedValue);
		}

		return sum.toFixed(2);
	});
}
