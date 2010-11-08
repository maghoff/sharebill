function() {
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

                    var list = $('<tbody id="totals_summary"></tbody>');
                    for (user in user_total_credits) {
                        var value = user_total_credits[user];
                        var cr = $('<td class="credits"></td>');
                        var dr = $('<td class="debets"></td>');
                        (value > 0 ? cr : dr).text(Math.abs(value) || "");

                        var row = $('<tr></tr>');
                        row.append($('<td></td>').text(user));
                        row.append(dr);
                        row.append(cr);
                        list.append(row);
                    }
                    $("#totals_summary").replaceWith(list);
                }
            }
        }
    };
}
