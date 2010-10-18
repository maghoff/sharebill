function(newDoc, oldDoc, userCtx) {
    if (newDoc._deleted) return;

    var totals = {"credits": 0, "debets": 0};
    var types = ["credits", "debets"];
    for (type_n in types) {
        var type = types[type_n];
        for (name in newDoc.transaction[type]) {
            var value = newDoc.transaction[type][name];
            totals[type] += value;

            if (value < 0) throw({forbidden: "All values must be positive. " +
                "(" + type + ": " + name + " = " + value + ")"});

            /*if (value != Math.floor(value)) {
                throw({forbidden : 'The values in a transaction must be whole numbers'});
            }*/
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
