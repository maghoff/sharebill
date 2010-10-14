function(newDoc, oldDoc, userCtx) {
    var transaction_total = 0;
    for (name in newDoc.transaction) {
        var value = newDoc.transaction[name];
        transaction_total += value;
        /*if (value != Math.floor(value)) {
            throw({forbidden : 'The values in a transaction must be whole numbers'});
        }*/
    }
    if (transaction_total != 0) {
        throw({
            forbidden : 'The transaction must have a total of zero ' +
                '(Actual total: ' + transaction_total + ')'
        });
    }
}
