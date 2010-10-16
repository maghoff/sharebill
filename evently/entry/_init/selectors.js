function() {

    var timestamp = function (date) {
        var pad = function (amount, width) {
            var str = amount.toString();
            while (str.length < width) str = "0" + str;
            return str;
        };

        date = date ? date : new Date();
        return
            pad(date.getUTCFullYear(), 4) + "-" +
            pad(date.getUTCMonth() + 1, 2) + "-" +
            pad(date.getUTCDate(), 2) + "T" +
            pad(date.getUTCHours(), 2) + ":" +
            pad(date.getUTCMinutes(), 2) + ":" +
            pad(date.getUTCSeconds(), 2) + "." +
            pad(date.getUTCMilliseconds(), 3) + "Z";
    };

    return {
        "form": {
            "submit": function() {
                post = {
                    "meta": {
                        "timestamp": timestamp(),
                        "description": $("#description_entry").val()
                    },
                    "transaction": {
                        "credits": { },
                        "debets": { }
                    }
                };

                $("form").find("tr").each(function(index) {
                    var add_pair = function(target, pair) {
                        var name = pair.filter(".name").val();
                        var value = parseInt(pair.filter(".value").val(), 10);
                        if (name && name != "" && value && value != 0) {
                            target[name] = value;
                        }
                    }
                    var row = $(this);
                    add_pair(post.transaction.credits, row.find(".cr"));
                    add_pair(post.transaction.debets, row.find(".dr"));
                });

                $$(this).app.db.saveDoc(post, {
                    success: function() { $("form").reset(); },
                    failure: function(msg) { alert(msg); }
                });

                return false;
            }
        }
    };
}
