function(key, values) {
	var totals = {
		"credits": {},
		"debets": {}
	};

	values.forEach(function (doc) {
		["credits", "debets"].forEach(function (dir) {
			var vals = doc.transaction[dir];
			for (agent in vals) {
				if (!vals.hasOwnProperty(agent)) continue;
				totals[dir][agent] = (totals[dir][agent] || 0) + vals[agent];
			}
		});
	});

	return { "transaction": totals };
}
