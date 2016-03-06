var SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;
var noReferences = require('infix/no_references');

var numberProvider = {
	parseInt: SchemeNumber.fn["string->number"],
	parseDecimal: function (before, after) {
		return SchemeNumber.fn["string->number"]("#e" + before + "." + after);
	},
	"+": SchemeNumber.fn["+"],
	"-": SchemeNumber.fn["-"],
	"*": SchemeNumber.fn["*"],
	"/": SchemeNumber.fn["/"],
};

module.exports = noReferences.evaluatorFor(numberProvider);
