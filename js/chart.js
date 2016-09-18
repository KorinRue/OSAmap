var Chart = function() {
	
	var svg,
		tip, tip2,
		width, height,
		x, y,
		xAxis, xAxis2, yAxis, yAxis2,
		brush,
		context,
		util;
	
	// return formatted dates for x axis
	var dayOfMonth = function (date) {
		var	formatDayOfMonth = d3.timeFormat("%-d");
		return formatDayOfMonth(date);
	}
	
	// return formatted months for x axis
	var month = function (date) {
		var	formatMonth = d3.timeFormat("%b");
		return formatMonth(date);
	}
	
	// display selected week
	var updateWeekDisplay = function(week) {
		setSubtitle("Week: " + util.formattedDate(week[0], '/') + " - " + util.formattedDate(week[1], '/'));
	}
	
	var brushstart = function() {
		if (!d3.event.sourceEvent) {
			return;
		}
		//console.log(x.invert(d3.event.sourceEvent.offsetX));
		currentSelection = d3.event.selection.map(x.invert);
		currentWeek = [d3.timeWeek.floor(currentSelection[0]), d3.timeWeek.ceil(currentSelection[0])];

	}

	// handle move of brush (aka "slider"): enforce snapping between weeks and update week display
	var brushmove = function() {

		var currSel, currWk;

		if (!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") {
			return;
		}

		// expand selection to week
		currSel = d3.event.selection.map(x.invert),
		currWk = currSel.map(d3.timeWeek.round);

		// if week is still empty, expand by setting floor/ceil
		if (currWk[0] >= currWk[1]) {
			currWk[0] = d3.timeWeek.floor(currSel[0]);
			currWk[1] = d3.timeWeek.ceil(currSel[1]);
		}

		// fix weird edge case when expansion is > 1 week
		if (d3.timeWeek.offset(currWk[0], 1) < currWk[1]) {
			currWk[1] = d3.timeWeek.offset(currWk[0], 1);
		}

		d3.select(this)
		.data([currWk.map( function(d) {
			return util.formattedDate2(d, " ");
		}).join("-")])
		.call(tip2)
		.call(brush.move, currWk.map(x));

		updateWeekDisplay(currWk);

	}

	// handle release of brush (aka "slider"): update the map with the selected dates
	var brushend = function(renderMap) {

		if (typeof currentWeek !== "undefined") {
			renderMap([currentWeek[0], currentWeek[1]]);
		}

	}
	
	// display title
	var setTitle = function(title) {
		$('.precipitation').html(title);
	}

	// display subtitle
	var setSubtitle = function(subTitle) {
		$('.precipitation_subtitle').html(subTitle);
	}

	// move month labels on x axis to center of month ... sort of.  it's a hack.
	var adjustTextLabels = function(selection) {
		selection.selectAll('.axis2 text')
		.attr('transform', 'translate(' + 35 + ',0)');
		//.attr('transform', 'translate(' + daysToPixels(1) / 2 + ',0)');
	}

	// does start date fall on a Sunday, and does end date equal start date?
	var sameDay = function(date) {
		return date[0].getDay() === 0 && (date[0].toString() == date[1].toString());
	}

	// given a date range, return number of Sun <-> Sun weeks it contains
	var nWeeks = function(dateRange) {
		return d3.timeWeek.count(dateRange[0], dateRange[1])
	}

	var tipText = function(d) {
		return "<div><div>" + 
				util.formattedDate2(new Date(d.date), " ") + 
				"</div><div><strong>" + 
				d.value + " in" +
				"</strong></div></div>"; 
	}

	var tipText2 = function(d) {
		return "<div><div><strong>" + d + "</strong></div></div>"; 
	}

	// initialize chart with axes and ticks but no data
	var initialize = function(dateRange) {

		var margin;

		util = Util();
		
        // init margins
        margin = {left: 40, right: 20}

        // init width and height
        width = 900 - margin.left - margin.right;
        height = 50;

        // init x and y scales
        x = d3.scaleTime().rangeRound([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        // init x axes and ticks
		xAxis = d3.axisBottom(x)
		.tickFormat(dayOfMonth)
		.ticks(nWeeks(dateRange));
		xAxis2 = d3.axisBottom(x)
		.tickFormat(month);

		// init y axes and ticks
		yAxis = d3.axisLeft(y).ticks(3);
		yAxis2 = d3.axisRight(y).ticks(3);

  		// set title
		setTitle("Precipitation: " + util.formattedDate(dateRange[0], '/') + " - " + util.formattedDate(dateRange[1], '/'));

		tip = d3.tip()
		.attr('id', 'barTip')
		.attr('class', 'd3-tip')
		.html(tipText);

		tip2 = d3.tip()
		.attr('id', 'brushTip')
		.attr('class', 'd3-tip')
		.html(tipText2);

		// add svg viewport
		svg = d3.select("#chart").append("svg")
		.attr("width", "800")
		.attr("height", 90)
		.attr("viewBox", "0 0 900 90")
		.attr("preserveAspectRatio", "none")
		.call(tip);

		// add context (the chart container)
		context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin.left + "," + 0 + ")");

	}

	// given preceip data, a callback to render map when dates change, and initial dates, render the chart
	var render = function(data, renderMap, initialDates) {

		var PADDING = -50,
			barWidth;

		// set domains: x is min to max date, y is 0 to max precip
		x.domain(d3.extent(data.map(function(d) { return new Date(d.date); })));
		y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);

		// render x axes and month labels
		context.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
		context.append("text")
		.attr("class", "x title")
		.attr("text-anchor", "middle")
		.attr("transform", "translate("+ (PADDING/2) +","+(height/2)+")rotate(-90)")
		.text("JFK Precip");
		context.append("g")
		.attr("class", "x axis2")
		.attr("transform", "translate(0," + (height + 12) + ")")
		.call(xAxis2)
		.call(adjustTextLabels);

		// render y axis and labels
		context.append("g")
		.attr("class", "y axis")
		.call(yAxis);
		context.append("g")
		.attr("class", "y axis2")
		.attr("transform", "translate(" + width + ",0)")
		.call(yAxis2);

		// render bars
		barWidth = width / data.length;

		context.selectAll("rect")
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
		.attr("width", barWidth - 1)
		.on('mouseover', tip.show)
  		.on('mouseout', tip.hide);

		// init brush
		brush = d3.brushX()
		.extent([ [0, 0], [width, height] ])
		.on("start", brushstart)
		.on("brush", brushmove)
		.on("end", function() { 
			brushend(renderMap);
		});

 		// append brush 
		// avoiding edge case when start date falls on Sunday
		if (sameDay(initialDates)) {
			initialDates[1] = d3.timeWeek.offset(initialDates[1], 1);
		}
		context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, initialDates.map(x));

		// locking the brush at a week
		d3.selectAll(".brush .handle").remove();

		d3.select(".brush")
		.data([initialDates.map( function(d) {
			return util.formattedDate2(d, " ");
		}).join("-")])
		.call(tip2)
		.call(brush.move, initialDates.map(x))
		.on('mouseover', tip2.show)
  		.on('mouseout', tip2.hide);
	}

	return {
		initialize: initialize,
		updateWeekDisplay: updateWeekDisplay,
		render: render
	}

};

