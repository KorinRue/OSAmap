// Leaflet template

$(document).ready(function () {
  // NYC-centered map
  var map = L.map('map').setView([40.731649,-73.977814], 10);
  var dataLayer;
  
  // baselayer
  L.tileLayer('https://2.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=HrbIxDcMexCChO2loCx3&app_code=Nre849qejL09vhelf0YGCA', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  maxZoom: 18
  }).addTo(map);
 

//mapzen geocoder
L.control.geocoder('search-xBMCfMW', {
  position: 'topright'
}).addTo(map);




var url = 'https://korin.cartodb.com/api/v2/sql?' + $.param({
    q: 'SELECT * FROM all_sites_2015',
  format: 'GeoJSON'
});
$.getJSON(url)
//time slider
.done(function (data) {
      //time slider
      var testlayer = L.geoJson(data, {
      //Create a marker layer (in the example done via a GeoJSON FeatureCollection)
        pointToLayer: function (feature,latlng) {
          return L.circleMarker(latlng);
        },
        //styling generic
        style: function (feature) {
          var style = {
            fillColor: '#1a9641',
            fillOpacity: 1,
            radius: 8,
            stroke: true,
            color: 'blue',
            weight: 3
          };
          //conditional to outline based on source
          if (feature.properties.sampler == 'NYCWTA') {
            style.color = 'purple';
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
      })

$("#dateSlider").dateRangeSlider();

/*
      sliderControl = L.control.sliderControl({
        position: "topright",
        layer: testlayer
      });

      
        //Make sure to add the slider to the map ;-)
        map.addControl(sliderControl);

        //And initialize the slider
        sliderControl.startSlider();

*/
      });

  });