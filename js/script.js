$(document).ready(function() {
		
	var defaults,
		util,
		noaa,
		chart,
		map,
		yearRange;

	// default selected date for any user-selected year is Jun 1
	var defaultYearDate = function() {
		var year = $('.years').val();
		return new Date(year, 5, 1);
	}

	// Sun <-> Sun week that contains default selected date
	var selectedWeekRange = function() {
		var date = defaultYearDate();
		return [d3.timeWeek.floor(date), d3.timeWeek.ceil(date)];
	}

	// Jan 1 <-> Dec 31 year that contains default selected date
	var selectedYearRange = function() {
		var date = defaultYearDate();
		return [d3.timeYear.floor(date), d3.timeYear.ceil(date)];
	}
	
	// given min/max years pulled from carto, return array of all years (for dropdown)
	var getYearRange = function(dateRange) {
		var years = [], range;
		range = dateRange.map(function(d){
			return (d.getFullYear());
		});
		for (var i = range[0]; i <= range[1]; i++) {
			years.push(i).toString();
		}
		return years;
	}

	// insert years into dropdown
	var insertYears = function(years) {
		$('.years').html("");
		for (var i = 0; i < years.length; i++) {
			$('.years').append("<option value=" + years[i] + ">" + years[i] + "</option>");
		}
		$('.years').val(years[years.length-1]);
	}

	// get noaa data for selected year, render chart and map
	var render = function() {
		util = Util();
 		noaa = NOAA();
 		noaa.getPrecipData(selectedYearRange())
 		.then(function(data) {
			chart = Chart();
			chart.initialize(selectedYearRange());
			chart.render(data, function(dates) { map.render(dates) }, selectedWeekRange());
			map.render(selectedWeekRange());
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

	// get date range from carto
	map.getDateRange()
	.then(function(dateRange) {

		// insert date range years into dropdown
		insertYears(getYearRange(dateRange));

		// render chart and map
		render();

		// re-render chart and map whenever selected year changes
		$('.years').select2({ minimumResultsForSearch: -1})
		.on('change', function (evt) {
			$('#chart').html("");
			render();
		});

	});


});

