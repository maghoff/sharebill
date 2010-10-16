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

            $("table#posts tbody>tr").append($('<td class="debets"></td>'));
            $("table#posts tbody>tr").each(function() { $(this).children("td.debets").first().before($('<td class="credits"></td>')) });

            $(".user_super_header").attr("colspan", users);
        }
        return column_map[id];
    };
    
    return {
        "table tbody": {
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
                    r.append($("<td></td>").text(v.meta.timestamp));
                    r.append($("<td></td>").text(v.meta.description));
                    for (var i = 0; i < users; ++i) {
                        r.append($('<td class="credits"></td>').text(lists.credits[i] || ""));
                    }
                    for (var i = 0; i < users; ++i) {
                        r.append($('<td class="debets"></td>').text(lists.debets[i] || ""));
                    }
                    $("table#posts tbody").append(r);
                }
            }
        }
    };
}
