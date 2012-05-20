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

    //var storage = JSON.parse(localStorage["single_payer"]);

    return {
        "form": {
            "_init": function() {
                //$(this).find("#");
                //$(this).find("#description_entry").focus();
                self.find("#timestamp").attr('value', timestamp());
                return false;
            },
            "submit": function(event) {
                event.preventDefault();

                var inputs = self.find("input");
                var status = self.find("#status");

                var payer = self.find("#payer").val();
                var totalAmount = parseInt(self.find("#amount").val(), 10);
                var credits = {};
                credits[payer] = totalAmount;

                var debits = {};

                var post = {
                    "meta": {
                        "timestamp": self.find("#timestamp").val(),
                        "description": self.find("#description_entry").val()
                    },
                    "transaction": {
                        "credits": credits,
                        "debets": debits
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
                self.children().slideUp(500, function () { self.remove(); });
            }
        }
    };
}
