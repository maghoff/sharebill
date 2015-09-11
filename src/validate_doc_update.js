function(newDoc, oldDoc, userCtx) {
	if (newDoc._deleted) return;

	if (newDoc._id === "instance_config") return;

	var SchemeNumber = require("views/lib/schemeNumber").SchemeNumber;
	var fractionParser = require("views/lib/fractionParser");

	var assert_has = function(path) {
		var node = newDoc;
		for (x in path) {
			var term = path[x];
			if (!node[term]) throw({forbidden: 'Minimal structure is: {"meta":{"description":<string>,"timestamp":<RFC3339-timestamp-in-UTC>},"transaction":{"credits":{},"debets":{}}}'});
			node = node[term];
		}
	};
	assert_has(["meta", "description"]);
	assert_has(["meta", "timestamp"]);
	assert_has(["transaction", "credits"]);
	assert_has(["transaction", "debets"]);

	var rfc3339 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
	if (!newDoc.meta.timestamp.match(rfc3339)) throw({forbidden: 'meta.timestamp must be RFC3339-formatted and in UTC with timezone specifier Z'});

	var fractionPattern = /^(\d+ )?\d+(\/\d+)?$/;
	var totals = { "credits": new SchemeNumber("0"), "debets": new SchemeNumber("0") };
	var types = ["credits", "debets"];
	for (type_n in types) {
		var type = types[type_n];
		for (name in newDoc.transaction[type]) {
			if (name.trim() !== name) {
				throw({
					forbidden: "Account names must be trimmed of white space."
				});
			}
			if (name === "") {
				throw({
					forbidden: "The empty string is an invalid account name."
				});
			}
			if (typeof newDoc.transaction[type][name] !== "string") {
				throw({
					forbidden: "All numbers must be represented as strings " +
						"to ensure exact arithmetics in all cases."
				});
			}
			if (!newDoc.transaction[type][name].match(fractionPattern)) {
				throw({
					forbidden: "All values must be integers or integer fractions, of " +
						"the pattern /^(\\d+ )?\\d+(\\/\d+)?$/"
				});
			}
			var value = fractionParser(newDoc.transaction[type][name]);
			totals[type] = SchemeNumber.fn['+'](totals[type], value);

			if (SchemeNumber.fn['negative?'](value)) throw({forbidden:
				"All values must be non-negative. " +
				"(" + type + ": " + name + " = " + value + ")"});
		}
	}
	if (!SchemeNumber.fn["="](totals.credits, totals.debets)) {
		throw({
			forbidden : 'Total credits must equal total debets in a transaction.\n' +
				'Actual total credits: ' + totals.credits + '\n' +
				'Actual total debets: ' + totals.debets
		});
	}
}
