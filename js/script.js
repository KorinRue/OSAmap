$(document).ready(function() {
		
	var defaults,
		noaa,
		chart,
		map,
		yearRange;

	var defaultYearDate = function() {
		var year = $('.years').val(),
			dateStr = year + "-06-01";
		return new Date(dateStr + " 00:00:00");
	}

	var selectedYearRange = function() {
		var date = defaultYearDate();
		return [d3.timeYear.floor(date), d3.timeYear.ceil(date)];
	}

	var selectedYearRangeStr = function() {
		return selectedYearRange().map(function(d){ return dateToDateStr(d) });
	}

	var selectedWeekRange = function() {
		var date = defaultYearDate();
		return [d3.timeWeek.floor(date), d3.timeWeek.ceil(date)];
	}

	var selectedWeekRangeStr = function() {
		return selectedWeekRange().map(function(d){ return dateToDateStr(d) });
	}

	var dateToDateStr = function(d) {
		var format = d3.timeFormat("%Y-%m-%d");
		return format(d);
	}
	
	var getYearRange = function(dateRange) {
		var years = [], range;
		range = dateRange.map(function(d){
			return (new Date(d + " 00:00:00")).getFullYear();
		});
		for (var i = range[0]; i <= range[1]; i++) {
			years.push(i).toString();
		}
		return years;
	}

	var insertYears = function(years) {
		$('.years').html("");
		for (var i = 0; i < years.length; i++) {
			$('.years').append("<option value=" + years[i] + ">" + years[i] + "</option>");
		}
		$('.years').val("2015");
	}

	var render = function() {
 		noaa = NOAA();
 		noaa.getPrecipData(selectedYearRangeStr())
 		.then(function(data) {
			chart = Chart();
			chart.initialize(selectedYearRangeStr());
			chart.render(data, function(dates) { map.render(dates) }, selectedWeekRange());
			map.render(selectedWeekRangeStr());
		});
	}

	// initialize map
	map = Map();
	map.initialize();

	/* For future use
	map.getEnteroRange()
	.then(function(enteroRange) {
		console.log(enteroRange);
	});
	*/

	// get all data then render chart and map
	map.getDateRange()
	.then(function(dateRange) {
		insertYears(getYearRange(dateRange));
		render();
	});

	// no live search required for year dropdown
	// re-render chart and map whenever selected year changes
	$('.years').select2({ minimumResultsForSearch: -1})
	.on('change', function (evt) {
		$('#chart').html("");
		render();
	});

});

