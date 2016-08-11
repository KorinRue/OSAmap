$(document).ready(function() {
		
	var INITIAL_DATE_RANGE = ["2015-05-31", "2015-06-07"],
		noaa,
		chart,
		map,
		yearRange;
	
	// takes "YYYY-MM-DD" string, returns new Date
	var parseDate = function(dateStr) {
		var [y,m,d] = dateStr.split("-");
		return (new Date(y, parseInt(m)-1, d));
	}

	var getYearRange = function(dateRange) {
		return ([dateRange.min, dateRange.max].map(function(d){
			return (new Date(d)).getFullYear().toString()
		}))
	}

	var insertYears = function(years) {
		for (var i = 0; i < years.length; i++) {
			$('.years').append("<option value=" + years[i] + ">" + years[i] + "</option>")
		}
	}

	map = Map();
	map.initialize();
	map.getEnteroRange().then(function(enteroRange) {
		console.log(enteroRange);
	});
	map.getDateRange().then(function(dateRange) {
		noaa = NOAA();
		yearRange = getYearRange(dateRange);
		insertYears($.unique(yearRange));
		noaa.getPrecipData(dateRange).then(function(data) {
			chart = Chart();
			chart.initialize(dateRange);
			chart.render(data, function(dates) { 
				map.render(dates); 
			}, INITIAL_DATE_RANGE.map(parseDate));
			map.render(INITIAL_DATE_RANGE);
		});
	});

	$('select').select2({
		minimumResultsForSearch: -1
	});
});

