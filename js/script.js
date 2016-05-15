// Leaflet template

$(document).ready(function () {
  // NYC-centered map
  var map = L.map('map', { zoomControl: false }).setView([40.731649,-73.977814], 11);
  var dataLayer;
  
  // baselayer
  L.tileLayer('https://api.mapbox.com/styles/v1/korin/cinyy74g70000aeni866flide/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29yaW4iLCJhIjoiY2luOWozYmYxMDBjdXYwa3ZxMnU4dm03MyJ9.Wcbx4hHyTfxP_GAan6jIKw', {
  attribution: '&copy; <a href=https://www.mapbox.com/about/maps/>Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  maxZoom: 18
  }).addTo(map);


  //mapzen geocoder
  L.control.geocoder('search-xBMCfMW', {
    position: 'topright'
  }).addTo(map);

  new L.Control.Zoom({ position: 'topright' }).addTo(map);


  var url = 'https://korin.cartodb.com/api/v2/sql?' + $.param({
      q: 'SELECT * FROM all_sites_2015',
    format: 'GeoJSON'
  });
  $.getJSON(url)
  //time slider
  .done(function (data) {

    dataLayer = L.geoJson(data, {

      pointToLayer: function (feature,latlng) {
        return L.circleMarker(latlng);
      },

      onEachFeature: function (feature, layer) {
        // mustache template for pop up
        layer.on('click', function () {
          var template = $('#template').html(); 
          var output = Mustache.render(template, feature.properties);
          layer.bindPopup(output).openPopup();
          });
        },

        //styling 
      style: function (feature) {
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


    $("#dateSlider").dateRangeSlider({
      bounds: {
        min: new Date(2015, 0, 1),
        max: new Date(2015, 11, 31)},
    });

    $("#dateSlider").bind("valuesChanged", function(e, data){
      var sql = "SELECT * FROM all_sites_2015 WHERE DATE > '" + data.values.min.toISOString() + "' AND DATE < '" + data.values.max.toISOString() + "'";
      var url = 'https://korin.cartodb.com/api/v2/sql?' + $.param({
        q: sql,
        format: 'GeoJSON'
      });

      $.getJSON(url)

      .done(function (data) {
        dataLayer.clearLayers();
        dataLayer.addData(data);
      });
    });

    //c3 chart
    var chart = c3.generate({
      bindto: '#chart',
        data: {
            columns: [
                ['data1', 0, 0, 0.94, 0.47, 0, 0.07, 0, 0, 0.07, 0, 0, 0.7, 0, 0, 0, 0, 0, 1.62, 0.01, 0.01, 0.01, 0, 0.01, 0.75, 0, 0.33, 0.06, 0, 0.01, 0.04, 0, 0.03, 1.18, 0, 0, 0.01, 0, 0.01, 0, 0.14, 0.01, 0, 0.01, 0, 0.01, 0.01, 0, 0.19, 0.01, 0, 0, 0.58, 0.2, 0, 0, 0, 0.01, 0, 0, 0.51, 0.01, 0.7, 0.3, 0.7, 3, 0, 0, 0.01, 0.02, 0.49, 0.04, 0, 0, 1.11, 0, 0, 0.02, 0.01, 0, 0.33, 0.02, 0, 0, 0, 0.12, 0.25, 0.23, 0.01, 0.01, 0.01, 0.03, 0, 0.01, 0.11, 0.01, 0, 0, 0.03, 0.01, 0.01, 0.19, 0, 0, 0, 0.04, 0, 0, 0.11, 0, 0, 0.87, 0.06, 0.19, 0.01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.01, 0.01, 0, 0, 0.02, 0.01, 0, 0.01, 0, 0, 0, 0.41, 0, 0, 0.01, 0, 0.01, 0.01, 0, 0, 0, 0, 0.01, 0, 0, 0, 0.02],
            ],
            type: 'bar'
        },
        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
            // or
            //width: 100 // this makes bar width 100px
        }
    });
/*
    setTimeout(function () {
        chart.load({
            columns: [
                ['data3', 1, 1, 1, 1,]
            ]
        });
    }, 1000);
*/

  });
});