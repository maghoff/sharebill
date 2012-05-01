function(doc) {
    if (doc._id === "instance_config") return;

	function getAllKeys(dict) {
		var keys = [];
		for (key in dict) {
			if (dict.hasOwnProperty(key)) keys.push(key);
		}
		return keys;
	}

	function mergeUnique(a, b) {
		var result = [];
		var i = 0, j = 0;
		while ((i < a.length) || (j < b.length)) {
			if (a[i] === undefined) {
				result.push(b[j++]);
			} else if (b[j] === undefined) {
				result.push(a[i++]);
			} else if (a[i] < b[j]) {
				result.push(a[i++]);
			} else if (b[j] < a[i]) {
				result.push(b[j++]);
			} else {
				result.push(a[i]);
				i++;
				j++;
			}
		}
		return result;
	}

	var creditors = getAllKeys(doc.transaction.credits).sort();
	var debitors = getAllKeys(doc.transaction.debets).sort();
	var actors = mergeUnique(creditors, debitors);

	actors.forEach(function(actor) {
		emit([actor, doc.meta.timestamp], doc);
	});
}
