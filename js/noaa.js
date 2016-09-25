var NOAA = function() {

    var NOAA = {
        URL: "http://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        TOKEN: "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX"
    }

    var noaaPayload = function(dateRange) {
        util = Util();
        return {
            datasetid: "GHCND",
            stationid: "GHCND:USW00094789",
            startdate: util.formattedDate(dateRange[0], '-'),
            enddate: util.formattedDate(dateRange[1], '-'),
            datatypeid: "PRCP",
            limit: "1000",
            includemetadata: "false",
            units: "standard"
        }
    }

    var  getPrecipData = function(dateRange) { 

        var util, noaa_payload, year, key, cache, precipData;

        return new Promise( function(resolve, reject) {

            year = dateRange[0].getFullYear();
            key = "noaa_precip_" + year;
            cache = localStorage;

            // try to fetch data from localStorage, fail and fetch from NOAA if cache is empty or expired.
            try { 
                var now, isExpired;

                precipData = JSON.parse(cache.getItem(key));
                if (! precipData) throw "" + year + " data is not cached.  Fetching from NOAA";

                isExpired = d3.timeDay.offset(precipData.lastUpdate, 1) < new Date(Date.now());
                if (isExpired) throw "" + year + " data is expired.  Re-fetching from NOAA";

                resolve(precipData.data);

            } catch (e) {

                console.log(e);

                $.ajax({
                    url: NOAA["URL"],
                    type: "GET",
                    data: noaaPayload(dateRange),
                    headers: {"token": NOAA["TOKEN"],},
                    beforeSend: function( xhr ) {
                        $("#chart").html("<i id='spinner' class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>");
                    }
                })
                .done(function(precipData, textStatus, jqXHR) {
                    precipData = {
                        lastUpdate: Date.now(), 
                        data: precipData.results
                    }
                    delete precipData.results;
                    cache.setItem(key, JSON.stringify(precipData))
                    resolve(precipData.data);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    reject("errors:" + errorThrown);
                })
                .always(function() {
                    $("#chart").html("");
                });
            }

        });
    }

    return {
        getPrecipData: getPrecipData
    }

};
