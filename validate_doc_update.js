function(newDoc, oldDoc, userCtx) {
    if (newDoc._deleted) return;

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

    var rfc3339 = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/;
    if (!newDoc.meta.timestamp.match(rfc3339)) throw({forbidden: 'meta.timestamp must be RFC3339-formatted and in UTC with timezone specifier Z'});

    var totals = {"credits": 0, "debets": 0};
    var types = ["credits", "debets"];
    for (type_n in types) {
        var type = types[type_n];
        for (name in newDoc.transaction[type]) {
            var value = newDoc.transaction[type][name];
            totals[type] += value;

            if (value < 0) throw({forbidden: "All values must be non-negative. " +
                "(" + type + ": " + name + " = " + value + ")"});

            if (value != Math.floor(value)) {
                throw({forbidden : 'The values in a transaction must be whole numbers'});
            }
        }
    }
    if (totals.credits != totals.debets) {
        throw({
            forbidden : 'Total credits must equal total debets in a transaction.\n' +
                'Actual total credits: ' + totals.credits + '\n' +
                'Actual total debets: ' + totals.debets
        });
    }
}
