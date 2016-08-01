// Leaflet template
$(document).ready(function() {
	
	// Constants
	
	var CARTODB = {
			"USER": "korin",
			"URL": "https://korin.cartodb.com/api/v2/sql?",
			"QUERY": "SELECT * FROM all_sites_2015",
			"DATE_QUERY": "SELECT MIN(date),MAX(date) FROM all_sites_2015"
		},
		
		// gus's noaa token
		NOAA = {
			"URL": "http://www.ncdc.noaa.gov/cdo-web/api/v2/data",
			"TOKEN": "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX"
		},
		INITIAL_DATE_RANGE = ["2015-05-31", "2015-06-07"],
	
	// Variables
		dataLayer,
		map;


	// Functions
	
	/* get min and max dates from map dataset */
	function getDateRange() {
	    return new Promise( function(resolve, reject) {
			sql = new cartodb.SQL({ user: CARTODB["USER"]});
			sql.execute(CARTODB["DATE_QUERY"])
			.done(function(data) {
				data.rows.forEach(function(d){
					var format = d3.timeFormat("%Y-%m-%d");
					resolve({min: format(d3.timeWeek.floor(new Date(d.min))), max: format(d3.timeWeek.ceil(new Date(d.max)))});
				})
			})
			.error(function(errors) {
				reject("errors:" + errors)
			});
		});
	}
	
	// get noaa precip data for a date range
    function getPrecipData(dateRange) {	
	    var noaa_playload = {
	            datasetid: "GHCND",
	            stationid: "GHCND:USW00094789",
	            startdate: dateRange.min,
	            enddate: dateRange.max,
	            datatypeid: "PRCP",
	            limit: "1000",
	            includemetadata: "false",
	            units: "standard"
	        };
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: NOAA["URL"],
                type: "GET",
                data: noaa_playload,
                headers: {"token": NOAA["TOKEN"],},
            })
            .done(function(data, textStatus, jqXHR) {
                resolve(data.results);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                reject("errors:" + errorThrown)
            })
            .always(function() {
                /* ... */
            });
        });
    }

	// initialize the map
	function initializeMap() {
		
		var BASEMAP_URL = 'https://api.mapbox.com/styles/v1/korin/cinyy74g70000aeni866flide/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29yaW4iLCJhIjoiY2luOWozYmYxMDBjdXYwa3ZxMnU4dm03MyJ9.Wcbx4hHyTfxP_GAan6jIKw',
			ATTRIBUTION = '&copy; <a href=https://www.mapbox.com/about/maps/>Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
		
		var map;
		
		// NYC-centered map
		map = L.map('map', {
			zoomControl: false
		}).setView([40.731649, -73.977814], 11);

		// baselayer
		L.tileLayer(BASEMAP_URL, {
			attribution: ATTRIBUTION,
			maxZoom: 18
		}).addTo(map);

		//mapzen geocoder
		L.control.geocoder('search-xBMCfMW', {
			position: 'topright'
		}).addTo(map);

		new L.Control.Zoom({
			position: 'topright'
		}).addTo(map);
		
		return map;
	}
	
	function getUrlParams(dates) {
		var params = {
			q: CARTODB["QUERY"],
			format: "GeoJSON"
		};
		if (dates !== null) {
			params.q = params.q + " WHERE date >= '" + dates[0] + "' AND date <= '" + dates[1] + "'";
		}
		return params;
	}

	function parseDate(dateStr) {
		var [y,m,d] = dateStr.split("-");
		return (new Date(y,m,d));
	}

	// render the map
	function renderMap(map, dates) {

		if (typeof dates === "undefined") {
			return;
		}
		
		var url = CARTODB["URL"] + $.param( getUrlParams(dates) );
			

		$.getJSON(url)
		.done(function(data) {

			if (dataLayer) {
				map.removeLayer(dataLayer);
			}
			
			dataLayer = L.geoJson(data, {

				pointToLayer: function(feature, latlng) {
					return L.circleMarker(latlng);
				},

				onEachFeature: function(feature, layer) {
					// mustache template for pop up
					layer.on('click', function() {
						var template = $('#template').html();
						var output = Mustache.render(template, feature.properties);
						layer.bindPopup(output).openPopup();
					});
				},

				style: function(feature) {
					var style = {
						fillColor: '#1a9641',
						fillOpacity: 1,
						radius: 5,
						stroke: true,
						color: 'black',
						weight: 3
					};
					//conditional to outline based on source
					if (feature.properties.sampler == 'NYCWTA') {
						style.color = 'white';
					}

					//conditional to color points based on enterococcus counts
					if (feature.properties.entero > 105) {
						style.fillColor = '#fdae61';
					}

					if (feature.properties.entero > 640) {
						style.fillColor = '#d7191c';
					}

					return style;
				},

			}).addTo(map);

		});
	}

	/* 
	   Main routine:
	   1. get date range from cartoDB
	   2. get precip date for date range from NOAA
	   3. render the chart
	   4. render the map
	*/
	getDateRange().then(function(dateRange) {
		getPrecipData(dateRange).then(function(data) {
			var chart = Chart(),
				map = initializeMap();
			chart.initialize(dateRange);
			chart.render(data, function(dates) { 
				renderMap(map, dates); 
			}, [parseDate(INITIAL_DATE_RANGE[0]), parseDate(INITIAL_DATE_RANGE[1])] );
			renderMap(map, INITIAL_DATE_RANGE);
		});
	});
});

