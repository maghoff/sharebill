function(doc) {
    var post = doc.transaction;
    for (p in post) {
        emit(p, post[p]);
    }
}
