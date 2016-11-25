var NOAA = function() {

    var NOAA = {
        URL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        TOKEN: "DKkaIwRgdAtlwYgARVlziBXyuPfhITqD"
    }

    var  getPrecipData = function(dateRange) { 
        var util = Util(),
            year = dateRange[0].getFullYear(),
            noaa_payload = {
                datasetid: "GHCND",
                stationid: "GHCND:USW00094789",
                startdate: util.formattedDate(dateRange[0], '-'),
                enddate: util.formattedDate(dateRange[1], '-'),
                datatypeid: "PRCP",
                limit: "1000",
                includemetadata: "false",
                units: "standard"
            };
        return new Promise( function(resolve, reject) {

            /*
            var precipData = getNOAAData(year);
            precipData = {
                lastUpdate: Date.now(), 
                data: precipData.results
            }

            delete precipData.results;
            $("#chart").html("");
            resolve(precipData.data);
            */

            $.ajax({
                url: NOAA["URL"],
                type: "GET",
                data: noaa_payload,
                headers: {"token": NOAA["TOKEN"],},
                beforeSend: function( xhr ) {
                    $("#chart").html("<i id='spinner' class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>");
                }
            })
            .done(function(data, textStatus, jqXHR) {
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
