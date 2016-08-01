var NOAA = function() {

    var NOAA = {
        URL: "http://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        TOKEN: "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX"
    }

    var  getPrecipData = function(dateRange) { 
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

    return {
        getPrecipData: getPrecipData
    }

};
