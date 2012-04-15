function () {
	var targetTop = this[0].offsetTop;
    this.css('opacity', 0.2);
    this.animate({opacity: 1}, 500);
    $('html').animate(
    	{
    		scrollTop: targetTop
    	},
    	'slow',
    	function () {
            $(this).find("#description_entry").focus();
    	}
    );
}
