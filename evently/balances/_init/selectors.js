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
                    var user_total_credits = {};

                    for (row in data.rows) {
                        var r = data.rows[row];
                        var type = r.key[0];
                        var user = r.key[1];
                        var value = new Fraction(r.value);

                        if (type !== "credits") value = value.multiply(-1);

                        user_total_credits[user] = value.add(user_total_credits[user] || 0);
                    }

                    var sorted_keys = function(d, sort_func) {
                        return Object.keys(d).sort();
                    };

                    var list = $('<tbody id="totals_summary"></tbody>');
                    sorted_keys(user_total_credits).forEach(function(user) {
                        var value = user_total_credits[user];
                        var cr = $('<td class="credits currency"></td>');
                        var dr = $('<td class="debets currency"></td>');
                        var sign = (value.numerator < 0 ? -1 : 1);
                        (value.numerator > 0 ? cr : dr).text(sharebill.formatCurrencyShort(value.multiply(sign)));

                        var userpage = '_show/userpage?user=' + encodeURIComponent(user);

                        var row = $('<tr></tr>');
                        row.append($('<td></td>').append($('<a></a>').text(user).attr('href', userpage)));
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
