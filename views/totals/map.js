function(doc) {
    //var Fraction = require("views/lib/fraction").Fraction;

    for (t in doc.transaction) {
        var v = doc.transaction[t];
        for (p in v) {
            emit([t, p], v[p]);
        }
    }
}
