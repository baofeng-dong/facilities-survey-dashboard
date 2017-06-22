//function to send query to map/_query to args and build the points map
function rebuildShelters(args) {
    //clear previous points markers
    resetLayers();

    console.log(args);

    $.getJSON('map/_query', args, function(data) {
        if(args['csv'] == "yes") {
                console.log(data.data);
                download("bus_shelters_cleaning_data.csv", data.data);
            }
        else
                console.log(data);
                $(data.data).each(function(index, item) {
                    //clear the rating list for each different shelter
                    ratingsList.length = 0;
                    // get lat and long from data.data json
                    var shelterLocation = item.location;
                    //split the string of shelterLocation into an array
                    var locationValues = shelterLocation.split(",")

                    //cast string value into float to get shelter lat and lng
                    var shelterLat = parseFloat(locationValues[0]);
                    var shelterLng = parseFloat(locationValues[1]);
                    var shelterLatlng = L.latLng(shelterLat,shelterLng);

                    //get integer ratings from the returned strings
                    var graffitiRating = parseInt(item.graffiti, 10);
                    var litterRating = parseInt(item.litter, 10);
                    var washedRating = parseInt(item.washed, 10);
                    var roofRating = parseInt(item.roof, 10);
                    var glassRating = parseInt(item.glass, 10);
                    var benchRating = parseInt(item.bench, 10);
                    var trashcanRating = parseInt(item.trashcan, 10);
                    var lidRating = parseInt(item.lid, 10);
                    var trashcangraffitiRating = parseInt(item.trashcangraffiti, 10);
                    ratingsList.push(graffitiRating,litterRating,washedRating,roofRating,
                        glassRating,benchRating,trashcanRating,lidRating,trashcangraffitiRating);
                    //console.log(ratingsList);
                    var avgRating = calculateAvg(ratingsList);
                    //console.log("Average rating: ", avgRating);

                    // defines popup content for bus shelters
                    var shelter_popup = L. popup().setContent(
                        "<b>Shelter:</b>" + " " + item.shelter + '<br />' + 
                        "<b>Average Rating:</b>" + " " + avgRating + '<br />' +
                        "<b>Contract Region:</b>" + " " + item.region + '<br />' +
                        "<b>Manager:</b>" + " " + item.manager + '<br />' + 
                        "<b>Date:</b>" + " " + item.date + '<br />' + 
                        "<b>Time:</b>" + " " + item.time + '<br />' +
                        "<b>No Graffiti:</b>" + " " + item.graffiti + '<br />' +
                        "<b>No Litter:</b>" + " " + item.litter + '<br />' +
                        "<b>Pressure Washed:</b>" + " " + item.washed + '<br />' + 
                        "<b>Roof Clean:</b>" + " " + item.roof + '<br />' + 
                        "<b>Glass Dried:</b>" + " " + item.glass + '<br />' +
                        "<b>Bench Dried:</b>" + " " + item.bench + '<br />' +
                        "<b>Trashcan Empty:</b>" + " " + item.trashcan + '<br />' +
                        "<b>Trashcan Lid Clean:</b>" + " " + item.lid + '<br />' +
                        "<b>Trashcan Free of Graffiti:</b>" + " " + item.trashcangraffiti + '<br />' +
                        "<b>Need Repair:</b>" + " " + item.repair + '<br />' +
                        "<b>Comments:</b>" + " " + item.comments
                        );
                    shelterStyle = getStyle(avgRating);
                    //defines bus shelters
                    var shelter = L.circleMarker(shelterLatlng, shelterStyle).bindPopup(shelter_popup, {showOnMouseOver:true});

                    //add shelter markers to odPairLayerGroup
                    shelterGroup.addLayer(shelter);

                    // add shelterGroup to mymap
                    shelterGroup.addTo(mymap);
                });
        //}
        

    });
    //addLabel();
}

//function to send query to map/_max_query to args and build the points map
function rebuildPlatform(args, geojson, callback) {
    //clear previous points markers
    resetLayers();

    console.log(args);

    $.getJSON('map/_station_query', args, function(data) {
        console.log(data);

        $(data.data).each(function(index, item) {
            //clear the rating list for each different shelter
            ratingsList.length = 0;
            // get lat and long from data.data json
            /*var shelterLocation = item.location;
            //split the string of shelterLocation into an array
            var locationValues = shelterLocation.split(",")

            //cast string value into float to get shelter lat and lng
            var shelterLat = parseFloat(locationValues[0]);
            var shelterLng = parseFloat(locationValues[1]);
            var shelterLatlng = L.latLng(shelterLat,shelterLng);*/

            //get integer ratings from the returned strings
            var brCleanedRating = parseInt(item.bathroom_cleaned, 10);
            var brStockedRating = parseInt(item.bathroom_stocked, 10);
            var benchCleanedRating = parseInt(item.bench_cleaned, 10);
            var electricRating = parseInt(item.electric, 10);
            var landscapingRating = parseInt(item.landscaping, 10);
            var lotNotrashRating = parseInt(item.lot_notrash, 10);
            var pathwayTrashRating = parseInt(item.pathway_trash, 10);
            var platformCleanedRating = parseInt(item.platform_cleaned, 10);
            var platformHosedRating = parseInt(item.platform_hosed, 10);
            var shelterHosedRating = parseInt(item.shelter_hosed, 10);
            var sweptRating = parseInt(item.swept, 10);
            var trackLitterRating = parseInt(item.track_litter, 10);
            var trashEmpiedRating = parseInt(item.trash_empied, 10);
            var vegetationRating = parseInt(item.vegetation, 10);
            ratingsList.push(brCleanedRating, brStockedRating, benchCleanedRating, 
                electricRating, landscapingRating, lotNotrashRating, pathwayTrashRating,
                platformHosedRating, platformCleanedRating, shelterHosedRating,
                sweptRating, trackLitterRating, trashEmpiedRating, vegetationRating);
            console.log(ratingsList);
            var avgRating = calculateAvg(ratingsList);
            console.log("Average rating: ", avgRating);
            
            ratingsDict[item.station] = avgRating;

            // defines popup content for bus shelters
            var station_popup = L. popup().setContent(
                "<b>Station:</b>" + " " + item.station + '<br />' + 
                "<b>Average Rating:</b>" + " " + avgRating + '<br />' +
                "<b>Cleaning Crew:</b>" + " " + item.crew + '<br />' +
                "<b>Wash Crew:</b>" + " " + item.wash + '<br />' +
                "<b>Inspector:</b>" + " " + item.inspector + '<br />' + 
                "<b>Date:</b>" + " " + item.date + '<br />' + 
                "<b>Time:</b>" + " " + item.time + '<br />' +
                "<b>Platform Cleaned:</b>" + " " + item.platform_cleaned + '<br />' +
                "<b>Comments:</b>" + " " + item.comments
                );
            popupDict[item.station] = station_popup;
        });
        console.log(ratingsDict);
        console.log(popupDict);
        if(callback) {
            callback(geojson);
        }

    });
    //addLabel();
}

function getStyle(rating) {
    return {
        clickable: true,
        fillColor: getColor(rating),
        radius: 10,
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.8
    }
}

//calculate average of an array list
function calculateAvg(arrayList) {
    var sum = 0;
    var counter = 0;
    len = arrayList.length;

    for(var i = 0; i < len; i++) {
        if (!isNaN(arrayList[i])) {
            sum += arrayList[i];
            counter ++;
        }
    }
    var avg = sum/counter;
    avg = avg.toFixed(2);
    return avg
}

//function for expanding/collapsing div content
function toggle_tb(){
    var div = $("#control-section");
    $('#toggle').unbind("click").click(function(){
         //div.slideToggle('fast');
         
         if ($(this).attr('value') == 'Hide') {
            console.log(this + 'hide selected')
            div.animate({
                height: '0%'
                }).hide()
            $(this).attr('value','Show')
            
        } else {
            console.log(this + 'show selected')
            div.animate({
                height: '100%'
                }).show()
            $(this).attr('value','Hide')
        
            }
       });
}
//load date range picker and calls rebuildShelter function once date is entered
function loadCalendar() {
    $(function() {

    var start = moment().subtract(29, 'days');
    var end = moment();

    function myCallback(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        sel_args.start = start.format("MM-DD-YYYY");
        sel_args.end = end.format("MM-DD-YYYY");
        console.log(sel_args);

        resetLayers();
        sel_args.csv = "no";
        //rebuild shelters based on new args
        rebuildShelters(sel_args);
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, myCallback);

    myCallback(start, end);
    
});
}

//function to add geojson layer to map
function addBoundaryLayer(geojson) {
    //console.log(geojson);
    var path = base + 'static/geojson/';

    $.getJSON(path + geojson, function(data) {
        console.log(data);
        boundary = L.geoJson(data, {
            style: style
        }).addTo(boundaryLayer);
        console.log(boundary);

        boundaryLayer.addTo(mymap);
        boundaryLayer.bringToBack();
        console.log(geojson + " added to mymap!");
    })
}

//function to add point layer to map
function addPointLayer(geojson) {
    //console.log(geojson);
    var path = base + 'static/geojson/';
    var pointLayer;

    $.getJSON(path + geojson, function(data) {
        console.log(data);
        pointLayer = L.geoJson(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, getStationStyle(
                    feature.properties.STATION)).bindPopup(
                    popupDict[feature.properties.STATION]);
            }
            /*onEachFeature: function(feature, layer) {
                layer.bindPopup(feature.properties.station)
            }*/
        }).addTo(pointGroup);
        console.log(pointLayer);
        pointGroup.addTo(mymap);
        pointGroup.bringToBack();
        
        console.log(geojson + " added to mymap!");
    })
}

//download csv file
function download(filename, text) {
        var a = document.createElement("a");
        a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(text);
        a.download = filename;
        
        a.target - "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    $("#generate-btn").on('click', function(a) {
        sel_args.csv = "yes";
        rebuildShelters(sel_args);
    });

//function to get max station style based on average rating
function getStationStyle(rating) {
    return {
        clickable: true,
        fillColor: getStationColor(rating),
        radius: 10,
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.8
    }
}

//style function
function style(feature) {
    console.log(feature);
    return {
        color: "#909090",
        weight: 2.0,
        opacity: 0.8,
        fillOpacity: 0.0
    } 
}

//add label to map
function addLabel() {

    if(hasLegend) {
        return
    }

    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');
        categories = ['ORIGIN','DESTINATION'];

        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
                 (categories[i] ? categories[i] + '<br>' : '+');

        }

        return div;
    };

    legend.addTo(mymap);

    hasLegend = true;

}

function getStationColor(d) {
    return  d > 3.5 ? "#a6d96a" :
            d > 2.5 ? "#fdae61" :
            d > 0   ? "#d7191c" :
                                 "#545454" ;
}

function getColor(d) {
    return  d > 3.5 ? "#80ff00" :
            d > 2.5 ? "#ff8000" :
                                 "#ff4000" ;
}

function getBaseColor(rte) {
    return rte == 90  ? '#d02c0f' :
           rte == 100 ? '#0069AA' :
           rte == 190 ? '#FFC425' :
           rte == 200 ? '#008752' :
           rte == 203 ? '#c044ec' :
           rte == 290 ? '#D15F27' :
                        '#1c4ca5' ;
}