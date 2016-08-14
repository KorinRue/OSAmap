var NOAA = function() {

    var NOAA = {
        URL: "http://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        TOKEN: "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX"
    }

    var  getPrecipData = function(dateRange) { 
        var noaa_playload = {
                datasetid: "GHCND",
                stationid: "GHCND:USW00094789",
                startdate: dateRange[0],
                enddate: dateRange[1],
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
                beforeSend: function( xhr ) {
                    $("#chart").html("<i id='spinner' class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>");
                }
            })
            .done(function(data, textStatus, jqXHR) {
                console.log(data);
                resolve(data.results);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                reject("errors:" + errorThrown)
            })
            .always(function() {
                $("#chart").html("");
            });
        });
    }

    return {
        getPrecipData: getPrecipData
    }

};
