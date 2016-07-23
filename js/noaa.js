var NOAA = (function() {

    var NOAA_URL = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        NOAA_TOKEN = "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX",
        noaa_playload = {
            datasetid: "GHCND",
            // jfk
            stationid: "GHCND:USW00094789",
            // central park
            //stationid: "GHCND:USW00094728",
            startdate: "2015-01-01",
            enddate: "2015-12-31",
            datatypeid: "PRCP",
            limit: "1000",
            includemetadata: "false",
            units: "standard",
        }

    var getPrecipData = function(dateRange) {
        noaa_playload.startdate = dateRange.min;
        noaa_playload.enddate = dateRange.max;
        return new Promise( function(resolve, reject) {
            console.log(noaa_playload);
            $.ajax({
                url: NOAA_URL,
                type: "GET",
                data: noaa_playload,
                headers: {"token": NOAA_TOKEN,},
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
        precipData: getPrecipData
    }

});
