$(document).ready(function() {
		
	var defaults,
		noaa,
		chart,
		map,
		yearRange;

	var getDefaults = function() {
		var initialDateStr = "2015-06-01",
			// hack to correct for time zone offset when getting new date
			initialDate = new Date(initialDateStr + " 00:00:00"),
			initialWeek = [d3.timeWeek.floor(initialDate), d3.timeWeek.ceil(initialDate)],
			initialWeekStr = initialWeek.map(function(d){ return dateToDateStr(d) });
			initialYear = [d3.timeYear.floor(initialDate), d3.timeYear.ceil(initialDate)],
			initialYearStr = initialYear.map(function(d){ return dateToDateStr(d) }),
			initialYearWeek = [d3.timeWeek.ceil(initialYear[0]), d3.timeWeek.floor(initialYear[1])],
			initialYearWeekStr = initialYearWeek.map(function(d){ return dateToDateStr(d) });
		return {
			initialDateStr: initialDateStr,
			initialDate: initialDate,
			initialWeek: initialWeek,
			initialWeekStr: initialWeekStr,
			initialYear: initialYear,
			initialYearStr: initialYearStr,
			initialYearWeek: initialYearWeek,
			initialYearWeekStr: initialYearWeekStr
		}
	}

	var dateToDateStr = function(d) {
		var format = d3.timeFormat("%Y-%m-%d");
		return format(d);
	}
	
	// takes "YYYY-MM-DD" string, returns new Date
	var parseDate = function(dateStr) {
		var [y,m,d] = dateStr.split("-");
		return (new Date(y, parseInt(m)-1, d));
	}

	var getYearRange = function(dateRange) {
		var years = [];
			range = dateRange.map(function(d){return (new Date(d)).getFullYear()});
		for (var i = range[0]; i <= range[1]; i++) {
			years.push(i).toString();
		}
		return years;
	}

	var insertYears = function(years) {
		for (var i = 0; i < years.length; i++) {
			$('.years').append("<option value=" + years[i] + ">" + years[i] + "</option>");
		}
	}

	defaults = getDefaults();
	/*
	console.log(defaults.initialYearWeek.map( function(d) {
		return dateToDateStr(d);
	}));
	*/
	map = Map();
	map.initialize();
	map.getEnteroRange().then(function(enteroRange) {
		//console.log(enteroRange);
	});
	map.getDateRange().then(function(dateRange) {
		noaa = NOAA();
		yearRange = getYearRange(dateRange);
		insertYears($.unique(yearRange));
  		noaa.getPrecipData(defaults.initialYearStr).then(function(data) {
			chart = Chart();
			chart.initialize(dateRange);
			chart.render(data, function(dates) { 
				map.render(dates); 
			}, defaults.initialWeek);
			map.render(defaults.initialWeekStr);
		});
	});

	$('select').select2({
		minimumResultsForSearch: -1
	});
});

