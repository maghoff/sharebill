function() {
    // Nabbed from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) Object.keys = function(o) {
        if (o !== Object(o))
            throw new TypeError('Object.keys called on non-object');
        var ret=[],p;
        for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
        return ret;
    };

    return {
        "#totals_summary": {
            "_changes": {
                "query": {
                    view: "totals",
                    group: true,
                    reduce: true
                },
                "after": function(data) {
                    var sumrow = $("table#posts>tbody>tr#totals");

                    var user_total_credits = {};

                    for (row in data.rows) {
                        var r = data.rows[row];
                        var type = r.key[0];
                        var user = r.key[1];
                        var value = r.value;

                        if (value == 0) value = "";

                        var credit_value;
                        if (type == "credits") credit_value = value;
                        else credit_value = -value;
                        user_total_credits[user] = (user_total_credits[user] || 0) + credit_value;
                    }
                    
                    var sorted_keys = function(d, sort_func) {
                        return Object.keys(d).sort();
                    };

                    var list = $('<tbody id="totals_summary"></tbody>');
                    sorted_keys(user_total_credits).forEach(function(user) {
                        var value = user_total_credits[user];
                        var cr = $('<td class="credits"></td>');
                        var dr = $('<td class="debets"></td>');
                        (value > 0 ? cr : dr).text(Math.abs(value) || "");

                        var row = $('<tr></tr>');
                        row.append($('<td></td>').text(user));
                        row.append(dr);
                        row.append(cr);
                        list.append(row);
                    });
                    $("#totals_summary").replaceWith(list);
                }
            }
        }
    };
}
