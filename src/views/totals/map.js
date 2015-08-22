function(doc) {
    if (doc._id === "instance_config") return;

    for (t in doc.transaction) {
        var v = doc.transaction[t];
        for (p in v) {
            emit([p, t], v[p]);
        }
    }
}
