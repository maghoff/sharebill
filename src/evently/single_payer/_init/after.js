function () {
	var self = this;
	var targetTop = this[0].offsetTop;
    self.css('opacity', 0.2);
    self.animate({opacity: 1}, 500);
    $('html').animate(
    	{scrollTop : targetTop},
    	'slow',
    	function () {
    		self.find("#payer").focus();
    	}
    );
}
