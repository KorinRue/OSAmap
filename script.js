// Leaflet template

$(document).ready(function () {
  // NYC-centered map
  var map = L.map('map', { zoomControl: false }).setView([40.731649,-73.977814], 11);
  var dataLayer;
  
  // baselayer
  L.tileLayer('https://api.mapbox.com/styles/v1/korin/cinyy74g70000aeni866flide/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29yaW4iLCJhIjoiY2luOWozYmYxMDBjdXYwa3ZxMnU4dm03MyJ9.Wcbx4hHyTfxP_GAan6jIKw', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
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
  });
});