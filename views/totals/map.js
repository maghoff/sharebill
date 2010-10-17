function(doc) {
    for (t in doc.transaction) {
        var v = doc.transaction[t];
        for (p in v) {
            emit([t, p], v[p]);
        }
    }
}
