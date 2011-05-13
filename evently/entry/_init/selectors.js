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
                var form = $(this);
                var inputs = form.find("input");
                var status = form.find("#status");

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

                var post = {
                    "meta": {
                        "timestamp": timestamp(),
                        "description": $("#description_entry").val()
                    },
                    "transaction": {
                        "credits": get_items($("table#credits")),
                        "debets": get_items($("table#debets"))
                    }
                };

                inputs.attr("disabled", true);
                form.fadeTo(1000, 0.60);
                status.text("Saving...");
                status.removeClass("error");
                status.addClass("info");

                $$(this).app.db.saveDoc(post, {
                    success: function() {
                        status.text("Saved successfully!");
                        status.removeClass("error");
                        status.addClass("info");
                        setTimeout(function() {
                            form.stop();
                            form.slideUp(500, form.remove);
                        }, 1000);
                    },
                    error: function(httpCode, httpMessage, body) {
                        status.text("Error: " + body);
                        status.removeClass("info");
                        status.addClass("error");
                        inputs.removeAttr("disabled");
                        form.stop();
                        form.fadeTo(100, 1.00);
                    }
                });

                return false;
            },
        },
        "#cancel": {
            "click": function() {
                var form = $(this).closest("form");
                form.slideUp(500, form.remove);
            }
        }
    };
}
