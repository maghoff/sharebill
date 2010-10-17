function() {
    var timestamp = function (date) {
        var pad = function (amount, width) {
            var str = amount.toString();
            while (str.length < width) str = "0" + str;
            return str;
        };

        date = date ? date : new Date();
        return (
            pad(date.getUTCFullYear(), 4) + "-" +
            pad(date.getUTCMonth() + 1, 2) + "-" +
            pad(date.getUTCDate(), 2) + "T" +
            pad(date.getUTCHours(), 2) + ":" +
            pad(date.getUTCMinutes(), 2) + ":" +
            pad(date.getUTCSeconds(), 2) + "." +
            pad(date.getUTCMilliseconds(), 3) + "Z"
        );
    };

    return {
        "form": {
            "submit": function() {
                var get_items = function(table) {
                    var items = {};
                    table.find("tr").each(function() {
                        var name = $(this).find(".name").val();
                        var value = parseInt($(this).find(".value").val(), 10);
                        if (name && name != "" && value && value != 0) {
                            items[name] = value;
                        }
                    });
                    return items;
                };

                post = {
                    "meta": {
                        "timestamp": timestamp(),
                        "description": $("#description_entry").val()
                    },
                    "transaction": {
                        "credits": get_items($("table#credits")),
                        "debets": get_items($("table#debets"))
                    }
                };

                $$(this).app.db.saveDoc(post, {
                    success: function() { $("form").reset(); },
                    failure: function(msg) { alert(msg); }
                });

                return false;
            }
        }
    };
}
