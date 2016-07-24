var Chart = function() {
	
	var MILLISECONDS_PER_WEEK = 604800000;

	var margin, 
		width, height,
		x, y,
		xAxis, yAxis,
		startDomain,
		startDate,
		startWeek,
		brush,
		svg,
		focus,
		context,
		bar,
		barWidth,
		dateRange,
		precipMap,
		drawMap;
	
	var customTimeFormat = function (date) {

		var formatMillisecond = d3.timeFormat(".%L"),
		formatSecond = d3.timeFormat(":%S"),
		formatMinute = d3.timeFormat("%I:%M"),
		formatHour = d3.timeFormat("%I %p"),
		formatDay = d3.timeFormat("%a %d"),
		formatWeek = d3.timeFormat("%d"),
		formatMonth = d3.timeFormat("%b"),
		formatYear = d3.timeFormat("%Y");

		return (d3.timeSecond(date) < date ? formatMillisecond
		: d3.timeMinute(date) < date ? formatSecond
		: d3.timeHour(date) < date ? formatMinute
		: d3.timeDay(date) < date ? formatHour
		: d3.timeWeek(date) < date && date.getDate() > 7 ? formatDay
		: d3.timeMonth(date) < date && date.getDate() > 7 ? formatWeek
		: d3.timeYear(date) < date ? function(date){return formatMonth(date).charAt(0);}
		: formatYear)(date);

	}
	
	var usingPrecip = function(data) {
		return data.value;
	}

	var yBounds = function(data) {
		return ({ min: d3.min(data, usingPrecip), max: d3.max(data, usingPrecip) });
	}

	var xBoundsSelected = function() {

		var domain = d3.event.selection.map(x.invert),
			date1 = domain[0],
			date2 = domain[1],
			minDate = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate(),
			maxDate = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();

		return({min: minDate, max: maxDate});

	}
	
	var brushstart = function() {

		startDate = d3.event.selection.map(x.invert);
		startWeek = [d3.timeWeek.floor(startDate[1]), d3.timeWeek.ceil(startDate[1])];
		currentWeek = startWeek;

	}
	

	var brushmove = function() {

		var dateFmt, currentDate;
		
		if (!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") {
			return;
		}

		currentSelection = d3.event.selection.map(x.invert);


		if (currentSelection[0] < startWeek[0]) {
			currentWeek = [d3.timeWeek.floor(currentSelection[0]), d3.timeWeek.ceil(currentSelection[0])];
		} else if (currentSelection[1] > startWeek[1]) {
			currentWeek = [d3.timeWeek.floor(currentSelection[1]), d3.timeWeek.ceil(currentSelection[1])];
		} else {
			currentWeek = [d3.timeWeek.floor(currentSelection[0]), d3.timeWeek.ceil(currentSelection[1])];
		}

		if (currentWeek[0] <= x.domain()[0] || currentWeek[1] >= x.domain()[1]) {
			return;
		}
		
		dateFmt = d3.timeFormat("%Y/%m/%d"),
		setSubtitle("Week: " + dateFmt(currentWeek[0]) + " - " + dateFmt(currentWeek[1]));

		d3.select(this).call(brush.move, currentWeek.map(x));



	}

	var brushend = function() {

		if (! d3.event.selection) {
			return;
		}

		drawMap(precipMap, xBoundsSelected());

	}
	
	var setSubtitle = function(subTitle) {
		$('.precipitation_subtitle').html(subTitle);
	}

	var setTitle = function(title) {
		$('.precipitation').html(title);
	}

	var initialize = function(dateRange, map, renderMap) {
		var weeks, dateFmt;
		
		drawMap = renderMap;
		precipMap = map

        // init margins
        margin = {top: 430, right: 20, bottom: 0, left: 20};

        // init width and height
        width = 900 - margin.left - margin.right;
        height = 500 - margin.top - margin.bottom;

        // init x and y
        x = d3.scaleTime().rangeRound([0, width]);
        y = d3.scaleLinear().range([height, 0]);


		// get # weeks in fullDateRange
		weeks = Math.round((new Date(dateRange.max)-new Date(dateRange.min))/ MILLISECONDS_PER_WEEK);

        // init x axis
		xAxis = d3.axisBottom(x)
		.tickFormat(customTimeFormat)
		.ticks(weeks);

		// init y axis
		yAxis = d3.axisLeft(y).ticks(3);

  		// set title
		dateFmt = d3.timeFormat("%Y/%m/%d");
		setTitle("Precipitation: " + dateFmt(new Date(dateRange.min)) + " - " + dateFmt(new Date(dateRange.max)));

	}

	var render = function(data, dates) {

		var bar,
			dateRange = dates,
			dateFmt;

		// add svg viewport
		svg = d3.select("#chart").append("svg")
		.attr("width", "95%")
		.attr("height", 100)
		.attr("viewBox", "0 0 900 100")
		.attr("preserveAspectRatio", "none");

		// add context (the chart container)
		context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin.left + "," + 0 + ")");

		// set domains: x is min to max date, y is 0 to max precip
		x.domain(d3.extent(data.map(function(d) { return new Date(d.date); })));
		y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);

		// render y axis
		context.append("g")
		.attr("class", "y axis")
		.call(yAxis);

		// render x axis
		context.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		// get bar width
		barWidth = width / data.length;

		// render bars
		bar = context.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("transform", function(d, i) { 
			return "translate(" + i * barWidth + ",0)"; 
		})
		.attr("class", "bar")
		.attr("y", function(d) { return y(d.value); })
		.attr("height", function(d) { 
			return height - y(d.value); 
		})
		.attr("width", barWidth - 1);

		// init brush
		brush = d3.brushX()
		.extent([ [0, 0], [width, height] ])
		.on("start", brushstart)
		.on("brush", brushmove)
		.on("end", brushend);
		
		// init brush group
		var brushG = context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, function() {
			dateFmt = d3.timeFormat("%Y/%m/%d");
			setSubtitle("Weeks: " + dateFmt(new Date(dates.min)) + " - " + dateFmt(new Date(dates.max)));
			return [new Date(dates.min),new Date(dates.max)].map(x);
		});

		// remove handles to lock the brush at a week
		d3.selectAll("g.brush rect.handle").remove();
		
	}

	return {
		initialize: initialize,
		render: render
	}

};

