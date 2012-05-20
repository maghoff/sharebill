function () {
	var currencyName = $('<span class="add-on"></span>').text(sharebill.currencyName());

	if (sharebill.currencyPosition() === "suffix") {
		$(this).append(currencyName);
		$(this).addClass("input-append");
	} else {
		$(this).prepend(currencyName);
		$(this).addClass("input-prepend");
	}
}
