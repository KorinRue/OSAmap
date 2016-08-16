var Map = function() {
	
	var CARTODB = {
			"USER": "korin",
			"URL": "https://korin.cartodb.com/api/v2/sql?",
			"QUERY": "SELECT * FROM all_sites_all_years",
			"DATE_QUERY": "SELECT MIN(date),MAX(date) FROM all_sites_all_years",
			"ENTERO_QUERY": "SELECT MIN(enterococcus),MAX(enterococcus) FROM all_sites_all_years"
		},
		BASEMAP_URL = 'https://api.mapbox.com/styles/v1/korin/cinyy74g70000aeni866flide/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29yaW4iLCJhIjoiY2luOWozYmYxMDBjdXYwa3ZxMnU4dm03MyJ9.Wcbx4hHyTfxP_GAan6jIKw',
		ATTRIBUTION = '&copy; <a href=https://www.mapbox.com/about/maps/>Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		leafletMap,
		dataLayer;

	var getUrlParams = function(dates) {

		var params = {
			q: CARTODB["QUERY"],
			format: "GeoJSON"
		};

		if (dates !== null) {
			params.q = params.q + " WHERE date >= '" + dates[0] + "' AND date <= '" + dates[1] + "'";
		}

		return params;
	}

	var initialize = function() {
					
		// NYC-centered map
		leafletMap = L.map('map', {
			zoomControl: false
		}).setView([40.731649, -73.977814], 11);

		// baselayer
		L.tileLayer(BASEMAP_URL, {
			attribution: ATTRIBUTION,
			maxZoom: 18
		}).addTo(leafletMap);

		//mapzen geocoder
		L.control.geocoder('search-xBMCfMW', {
			position: 'topright'
		}).addTo(leafletMap);

		new L.Control.Zoom({
			position: 'topright'
		}).addTo(leafletMap);

	}

	var getDateRange = function() {

	    return new Promise( function(resolve, reject) {

			sql = new cartodb.SQL({ user: CARTODB["USER"]});

			sql.execute(CARTODB["DATE_QUERY"])
			.done(function(data) {
				data.rows.forEach(function(d){
					var format = d3.timeFormat("%Y-%m-%d");
					resolve([format(d3.timeWeek.floor(new Date(d.min))), format(d3.timeWeek.ceil(new Date(d.max)))]);
				})
			})
			.error(function(errors) {
				reject("errors:" + errors)
			});
			
		});

	}

	var getEnteroRange = function() {

	    return new Promise( function(resolve, reject) {

			sql = new cartodb.SQL({ user: CARTODB["USER"]});

			sql.execute(CARTODB["ENTERO_QUERY"])
			.done(function(data) {
				data.rows.forEach(function(e){
					resolve({min: e.min, max: e.max});
				})
			})
			.error(function(errors) {
				reject("errors:" + errors)
			});
			
		});

	}

	var render = function(dates) {

		if (typeof dates === "undefined") {
			return;
		}
		
		var url = CARTODB["URL"] + $.param( getUrlParams(dates) );

		$.getJSON(url)
		.done(function(data) {

			if (dataLayer) {
				leafletMap.removeLayer(dataLayer);
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
					if (feature.properties.enterococcus > 34) {
						style.fillColor = '#fdae61';
					}

					if (feature.properties.enterococcus > 104) {
						style.fillColor = '#d7191c';
					}

					return style;
				},

			}).addTo(leafletMap);

		});
	}

    return {
    	initialize: initialize,
    	getDateRange: getDateRange,
    	getEnteroRange: getEnteroRange,
    	render: render
    }

};