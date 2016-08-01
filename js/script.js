// Leaflet template
$(document).ready(function() {
		
	var INITIAL_DATE_RANGE = ["2015-05-31", "2015-06-07"],
		noaa,
		chart,
		map;
	
	// takes "YYYY-MM-DD" string, returns new Date
	var parseDate = function(dateStr) {
		var [y,m,d] = dateStr.split("-");
		return (new Date(y, parseInt(m)-1, d));
	}

	map = Map();
	map.initialize();
	map.getDateRange().then(function(dateRange) {
		noaa = NOAA();
		noaa.getPrecipData(dateRange).then(function(data) {
			chart = Chart();
			chart.initialize(dateRange);
			chart.render(data, function(dates) { 
				map.render(map, dates); 
			}, INITIAL_DATE_RANGE.map(parseDate));
			map.render(map, INITIAL_DATE_RANGE);
		});
	});
});

