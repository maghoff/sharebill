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
                        var user = r.key[0];
                        var type = r.key[1];
                        var value = fractionParser(r.value);

                        if (type !== "credits") value = SchemeNumber.fn['*'](value, new SchemeNumber("-1"));

                        user_total_credits[user] = SchemeNumber.fn['+'](value, user_total_credits[user] || new SchemeNumber("0"));
                    }

                    var sorted_keys = function(d, sort_func) {
                        return Object.keys(d).sort();
                    };

                    var list = $('<tbody id="totals_summary"></tbody>');
                    sorted_keys(user_total_credits).forEach(function(user) {
                        var value = user_total_credits[user];
                        var cr = $('<td class="credits currency"></td>');
                        var dr = $('<td class="debets currency"></td>');
                        var sign = (SchemeNumber.fn["negative?"](value) ? -1 : 1);
                        (SchemeNumber.fn["negative?"](value) ? dr : cr).text(sharebill.formatCurrencyShort(SchemeNumber.fn["*"](value, sign)));

                        var userpage = 'user/' + encodeURIComponent(user);

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
