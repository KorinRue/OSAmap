var Util = function() {

	var formattedDate = function(d, separator) {
		var format = d3.timeFormat("%Y" + separator + "%m"+ separator + "%d");
		return format(d);
	}

	return {
		formattedDate: formattedDate
	}

}