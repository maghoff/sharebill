function toMixedNumber(num) {
	var floor = SchemeNumber.fn.floor(num);
	var rest = SchemeNumber.fn['-'](num, floor);
	return floor.toString() + " " + rest.toString();
}
