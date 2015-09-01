function(doc) {
    if (doc._id === "instance_config") return;

	var debits = doc.transaction["debets"];
	var credits = doc.transaction["credits"];

	for (account in debits) {
		emit(account, "-" + debits[account]);
	}
	for (account in credits) {
		emit(account, credits[account]);
	}
}
