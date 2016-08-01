var Chart = function() {
	
	var MILLISECONDS_PER_WEEK = 604800000;

	var margin, 
		width, height,
		x, y,
		xAxis, xAxis2, yAxis,
		startDomain,
		startDate,
		startWeek,
		brush,
		svg,
		focus,
		context,
		bar,
		barWidth,
		dateRange;
	
	var customTimeFormat = function (date) {

		var	formatWeek = d3.timeFormat("%-d"),
			formatMonth = d3.timeFormat("%b"),
			formatYear = d3.timeFormat("%Y");

		return (d3.timeWeek(date) < date ? formatDay
		: d3.timeMonth(date) <= date ? formatWeek
		: d3.timeYear(date) <= date ? formatMonth
		: formatYear)(date);

	}
	
	var customTimeFormat2 = function (date) {

		var	formatMonth = d3.timeFormat("%b"),
			formatYear = d3.timeFormat("%Y");

		return (d3.timeYear(date) <= date ? formatMonth: formatYear)(date);

	}
	
	var usingPrecip = function(data) {
		return data.value;
	}

	var updateWeekDisplay = function(week) {

		var dateFmt = d3.timeFormat("%Y/%m/%d");
		setSubtitle("Week: " + dateFmt(week[0]) + " - " + dateFmt(week[1]));

	}
	
	var brushstart = function() {
	}

	var brushmove = function() {

		var currentDate;
		
		if (!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") {
			return;
		}

		currentSelection = d3.event.selection.map(x.invert);
		currentWeek = [d3.timeWeek.floor(currentSelection[0]), d3.timeWeek.ceil(currentSelection[0])];

		if (currentSelection[0] < currentWeek[0]) {
			currentWeek = [d3.timeWeek.floor(currentSelection[0]), d3.timeWeek.ceil(currentSelection[0])];
		} else if (currentSelection[1] > currentWeek[1]) {
			currentWeek = [d3.timeWeek.floor(currentSelection[1]), d3.timeWeek.ceil(currentSelection[1])];
		}

		d3.select(this).call(brush.move, currentWeek.map(x));

		updateWeekDisplay(currentWeek);

	}

	var brushend = function(renderMap) {

		var dateFmt = d3.timeFormat("%Y-%m-%d");

		if (typeof currentWeek !== "undefined") {
			renderMap([dateFmt(currentWeek[0]), dateFmt(currentWeek[1])]);
		}

	}
	
	var setSubtitle = function(subTitle) {
		$('.precipitation_subtitle').html(subTitle);
	}

	var setTitle = function(title) {
		$('.precipitation').html(title);
	}

	function adjustTextLabels(selection) {
		selection.selectAll('.axis2 text')
		.attr('transform', 'translate(' + 35 + ',0)');
		//.attr('transform', 'translate(' + daysToPixels(1) / 2 + ',0)');
	}

	/*
	function daysToPixels(days, timeScale) {
	 	var d1 = new Date();
	 	timeScale || (timeScale = Global.timeScale);
		return timeScale(d3.timeWeek.offset(d1, days)) - timeScale(d1);
	}
	*/

	var initialize = function(dateRange) {

		var weeks, dateFmt;
		
        // init margins
        margin = {top: 430, right: 20, bottom: 0, left: 40};

        // init width and height
        width = 900 - margin.left - margin.right;
        height = 480 - margin.top - margin.bottom;

        // init x and y
        x = d3.scaleTime().rangeRound([0, width]);
        y = d3.scaleLinear().range([height, 0]);

		// get # weeks in fullDateRange
		weeks = Math.round((new Date(dateRange.max)-new Date(dateRange.min))/ MILLISECONDS_PER_WEEK);

        // init x axis
		xAxis = d3.axisBottom(x)
		.tickFormat(customTimeFormat)
		.ticks(weeks);

        // init x axis
		xAxis2 = d3.axisBottom(x)
		.tickFormat(customTimeFormat2);

		// init y axis
		yAxis = d3.axisLeft(y).ticks(3);

  		// set title
		dateFmt = d3.timeFormat("%Y/%m/%d");
		setTitle("Precipitation: " + dateFmt(new Date(dateRange.min)) + " - " + dateFmt(new Date(dateRange.max)));

		// add svg viewport
		svg = d3.select("#chart").append("svg")
		.attr("width", "90%")
		.attr("height", 90)
		.attr("viewBox", "0 0 900 90")
		.attr("preserveAspectRatio", "none");

		// add context (the chart container)
		context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin.left + "," + 0 + ")");

	}

	var render = function(data, renderMap) {

		var bar, dateFmt;

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

		// render x axis 2
		context.append("g")
		.attr("class", "x axis2")
		.attr("transform", "translate(0," + (height + 17) + ")")
		.call(xAxis2)
		.call(adjustTextLabels);

		var padding = -40;
		context.append("text")
		.attr("class", "x title")
		.attr("text-anchor", "middle")
		.attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")
		.text("Precip (in.)");

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
		.on("brush", brushmove)
		.on("end", function() { 
			brushend(renderMap);
		});
		
		// init brush group
		var brushG = context.append("g")
		.attr("class", "brush")
		.call(brush);

		// remove handles to lock the brush at a week
		d3.selectAll("g.brush rect.handle").remove();
		
	}

	return {
		initialize: initialize,
		updateWeekDisplay: updateWeekDisplay,
		render: render
	}

};

