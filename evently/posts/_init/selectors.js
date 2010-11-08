function() {
    var column_map = {}, users = 0;

    var get_column = function(id) {
        if (!(id in column_map)) {
            column_map[id] = users++;
            var h = $("<th></th>")
            h.text(id);
            $("#user_headers").append(h);
            $("#user_headers")
                .children(":nth-child(" + users + ")")
                    .before(h.clone());

            $("table#posts tbody>tr").append($('<td class="credits"></td>'));
            $("table#posts tbody>tr").each(function() { $(this).children("td.credits").first().before($('<td class="debets"></td>')) });

            $(".user_super_header").attr("colspan", users);
        }
        return column_map[id];
    };

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var format_timestamp = function(timestamp) {
        var month = parseInt(timestamp.substr(5, 2), 10);
        var day = parseInt(timestamp.substr(8, 2), 10);

        return months[month - 1] + " " + day;
    };

    return {
        "table#posts>tbody": {
            "_changes": {
                "query": {
                    view: "all",
                    type: "newRows",
                    descending: true
                },
                "after": function(row) {
                    var v = row.value;
                    var lists = {"credits": [], "debets": []};
                    for (var type in lists) {
                        for (var user in v.transaction[type]) {
                            var col = get_column(user);
                            lists[type][col] = v.transaction[type][user];
                        }
                    }

                    var r = $("<tr></tr>");
                    r.append($("<td></td>").text(format_timestamp(v.meta.timestamp)));
                    r.append($("<td></td>").text(v.meta.description));
                    for (var i = 0; i < users; ++i) {
                        r.append($('<td class="debets"></td>').text(lists.debets[i] || ""));
                    }
                    for (var i = 0; i < users; ++i) {
                        r.append($('<td class="credits"></td>').text(lists.credits[i] || ""));
                    }
                    $("table#posts>tbody>#totals").before(r);
                }
            }
        },
        "table#posts>tbody>#totals": {
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

                        var col = get_column(user);
                        sumrow.find("td." + type).slice(col, col+1).text(value);
                    }
                }
            }
        }
    };
}
