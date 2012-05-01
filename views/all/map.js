function(doc) {
    if (doc._id === "instance_config") return;

    emit(doc.meta.timestamp, doc);
}
