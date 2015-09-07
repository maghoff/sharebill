if (typeof require !== 'undefined') SchemeNumber = require('./views/lib/schemeNumber').SchemeNumber;

var evaluate = (function () {
	function repeat(s, n) { return new Array(n+1).join(s); }

	function evaluate_factor(input) {
		var pattern = /(^\s*(\d+) (\d+\/\d+))|(^\s*([-+])?(\d+)(\.(\d+))?)|(^\s*\()/;
		var match = input.match(pattern);
		if (!match) throw new Error("Expected number, found " + JSON.stringify(input.substr(0, 6)) + "...");
		var rest = input.substr(match[0].length);

		var FRAC = 1, NUM = FRAC+3, PAR = NUM+5;

		if (match[NUM]) {
			var sign = match[NUM+1] || "";
			var before = match[NUM+2];
			var after = match[NUM+4] || "";
			return [
				new SchemeNumber(sign + before + after + "/" + "1" + repeat('0', after.length)),
				rest
			];
		} else if (match[PAR]) {
			var nested = evaluate_expression(rest);
			var closing_pattern = /^\s*\)/;
			if (!(match = nested[1].match(closing_pattern))) throw new Error("Expected ')', found " + JSON.stringify(nested[1].substr(0, 6)) + "...");
			return [
				nested[0],
				nested[1].substr(match[0].length)
			];
		} else if (match[FRAC]) {
			return [
				SchemeNumber.fn['+'](new SchemeNumber(match[FRAC+1]), new SchemeNumber(match[FRAC+2])),
				rest
			];
		} else {
			throw new Error("Logic error");
		}
	}

	function evaluate_term(input) {
		var lhs_result = evaluate_factor(input);
		var lhs = lhs_result[0], rest = lhs_result[1];

		var pattern = /^\s*([*\/])/;
		var match;
		while (match = rest.match(pattern)) {
			rest = rest.substr(match[0].length);
			var rhs_result = evaluate_factor(rest);
			var rhs = rhs_result[0];
			rest = rhs_result[1];

			lhs = SchemeNumber.fn[match[1]](lhs, rhs);
		}

		return [ lhs, rest ];
	}

	function evaluate_expression(input) {
		var lhs_result = evaluate_term(input);
		var lhs = lhs_result[0], rest = lhs_result[1];

		var pattern = /^\s*([+-])/;
		var match;
		while (match = rest.match(pattern)) {
			rest = rest.substr(match[0].length);
			var rhs_result = evaluate_term(rest);
			var rhs = rhs_result[0];
			rest = rhs_result[1];

			lhs = SchemeNumber.fn[match[1]](lhs, rhs);
		}

		return [ lhs, rest ];
	}

	function evaluate(input) {
		var result = evaluate_expression(input);
		if (!result[1].match(/^\s*$/)) throw new Error("Unexpected: " + JSON.stringify(result[1].substr(0, 6)) + "...");
		return result[0];
	}

	return evaluate;
}());

if (typeof module !== "undefined") module.exports = evaluate;
