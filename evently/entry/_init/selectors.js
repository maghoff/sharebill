function() {
    var self = this;

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

    var sum_calculator = function() {
        var table = $(this).closest("table");

        var sum = 0;
        var sum_is_valid = true;
        table.find(".value").each(
            function(index, element) {
                var value_text = $(element).val();
                $(element).removeClass("error");
                if (value_text != "") {
                    var value = parseInt(value_text, 10);
                    if (value.toString(10) == value_text) {
                        sum = sum + value;
                    } else {
                        sum_is_valid = false;
                        $(element).addClass("error");
                    }
                }
            }
        );

        var sum_text = "-";
        if (sum_is_valid) {
            sum_text = sum.toString(10);
        }

        table.find("#sum").text(sum_text);
    };

    return {
        "form": {
            "_init": function() {
                return false;
            },
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
                        "description": form.find("#description_entry").val()
                    },
                    "transaction": {
                        "credits": get_items(form.find("table#credits")),
                        "debets": get_items(form.find("table#debets"))
                    }
                };

                inputs.attr("disabled", true);
                self.fadeTo(1000, 0.60);
                status.text("Saving...");
                status.removeClass("error");
                status.addClass("info");

                var app = $$(this).app;
                $$(this).app.db.saveDoc(post, {
                    success: function() {
                        status.text("Saved successfully!");
                        status.removeClass("error");
                        status.addClass("info");
                        setTimeout(function() {
                            self.stop();
                            self.slideUp(500, self.remove);
                        }, 1000);
                        $("#balances").evently("balances", app);
                    },
                    error: function(httpCode, httpMessage, body) {
                        status.text("Error: " + body);
                        status.removeClass("info");
                        status.addClass("error");
                        inputs.removeAttr("disabled");
                        self.stop();
                        self.fadeTo(100, 1.00);
                    }
                });

                return false;
            },
        },
        "#description_entry": {
            "change": function() {
                var is_valid = $(this).val() != "";
                if (is_valid) $(this).removeClass("error");
                else $(this).addClass("error");
            }
        },
        "input.dr.value": { "change": sum_calculator },
        "input.cr.value": { "change": sum_calculator },
        "#cancel": {
            "click": function(event) {
                event.preventDefault();
                self.slideUp(500, self.remove);
            }
        }
    };
}
