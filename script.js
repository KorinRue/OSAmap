
      function main() {
        cartodb.createVis('map', 'https://korin.carto.com/api/v2/viz/0ef105c8-73a9-11e6-b919-0e233c30368f/viz.json', {
            shareable: true,
            title: false,
            description: true,
            search: true,
            tiles_loader: true,
            center_lat: 40.731649,
            center_lon: -73.977814,
            zoom: 11,
            legends: false,
            scrollwheel: true,
            zoomControl: false
        })
        .done(function(vis, layers) {
          // basemap from Mapbox
          var basemap = layers[0];
          basemap.setUrl('https://api.mapbox.com/styles/v1/korin/cinyy74g70000aeni866flide/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29yaW4iLCJhIjoiY2luOWozYmYxMDBjdXYwa3ZxMnU4dm03MyJ9.Wcbx4hHyTfxP_GAan6jIKw')
          // setInteraction is disabled by default
          layers[1].setInteraction(true);
          layers[1].on('featureOver', function(e, latlng, pos, data) {
            cartodb.log.log(e, latlng, pos, data);
          });
          // you can get the native map to work with it
          var map = vis.getNativeMap();
          // now, perform any operations you need
          // map.setZoom(3);
          // map.panTo([50.5, 30.5]);
          map.maxZoom(18);
        })
        .error(function(err) {
          console.log(err);
        });
      }
      window.onload = main;
