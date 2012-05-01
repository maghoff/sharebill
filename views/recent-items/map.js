function(doc) {
    if (doc._id === "instance_config") return;

	if (doc.created_at) {
		emit(doc.created_at, doc);
	}
};