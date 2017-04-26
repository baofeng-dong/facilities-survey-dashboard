
//dictionary for storing query params and values
    var sel_args = {
        manager : "",
        region : "",
        repair : "",
        start : "",
        end : ""
    }

    //create layer to store all bus shelter points
    var shelterGroup = new L.FeatureGroup();
    //create group layer for MAX platform points
    var platformGroup = new L.FeatureGroup();

    //create an array list for storing ratings for each shelter
    var ratingsList = [];

    var hasLegend = false;
    var highLight = null;
    var selected;
    var style = {
                color: '#ff6600',
                weight: 2,
                opacity: 0.6,
                smoothFactor: 1,
                dashArray: '10,10',
                clickable: true
    };
    var newStyle = {
                color:'red',
                opacity: 0.9,
                weight:5
    }


//initialize map 
$(document).ready(function() {
    mymap = L.map('mapid', {scrollWheelZoom:true}).setView([45.48661, -122.65343], 11);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG11c2VyMTk3IiwiYSI6ImNpc254cHk1YTA1dngydm14bjkyamQ1NmsifQ.8ya7T1hHXtVmYOwMrVIuFw', {
    attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>',
    id: 'mapbox.light',
    maxZoom: 18,
    minZoom: 11
    }).addTo(mymap);
    console.log(mymap);

    var geocoder = L.control.geocoder('mapzen-JfUFYiC', geocoderOptions);
    var geocoderOptions = {
        autocomplete: true,
        pointIcon: 'https://cdn2.iconfinder.com/data/icons/travel-map-and-location/64/geo_location-128.png',
        position: 'topleft',
        expanded: true,
        panToPoint: true,
        placeholder: 'Search nearby',
        markers: true,
        focus: [45.48661, -122.65343],
        title: 'Address Search'
    }
    var markeroptions = {
        icon: myIcon,
        clickable: true,
        riseOnHover: true
    }
    var myIcon = L.icon({
        iconUrl: 'https://cdn2.iconfinder.com/data/icons/travel-map-and-location/64/geo_location-128.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
    });

    geocoder.setPosition('topright');

    //add geocoder to mymap
    geocoder.addTo(mymap);

    //load map with markers on initial page load with no filter params
    rebuildShelters(sel_args);

    //call toggle div function
    toggle_tb();

    //load calendar
    loadCalendar();

    //function for when a manager or supervisor is selected
    $('#filter_manager a').on('click', function() {
        var sel_manager = this.text
        console.log("manager selected: " + sel_manager)
        if (sel_manager == 'All') {
            sel_args.manager = '';
        } else {
            sel_args.manager = sel_manager;
        }

        $("#manager_btn").text(this.text+' ').append('<span class="caret"></span>');
        resetLayers();
        //rebuild shelters based on new args
        rebuildShelters(sel_args);
    });
    //function for when contract region is selected
    $('#filter_region a').on('click', function() {
        var sel_region = this.text
        console.log("contract region selected: " + sel_region)
        if (sel_region == 'All') {
            sel_args.region = '';
        } else {
            sel_args.region = sel_region;
        }
        $("#region_btn").text(this.text+' ').append('<span class="caret"></span>');

        resetLayers();
        //rebuild shelters based on new args
        rebuildShelters(sel_args);

    });
        //function for when need repair is selected
    $('#filter_repair a').on('click', function() {
        var sel_repair = this.text
        console.log("need repair selected: " + sel_repair)
        if (sel_repair == 'All') {
            sel_args.repair = '';
        } else {
            sel_args.repair = sel_repair;
        }
        $("#repair_btn").text(this.text+' ').append('<span class="caret"></span>');

        resetLayers();
        //rebuild shelters based on new args
        rebuildShelters(sel_args);

    });
})

//remove layers
function removeLayers(map) { 
    map.eachLayer(function(layer) {
        if (layer instanceof L.TileLayer == false) {
            map.removeLayer(layer);
            console.log("removed layer!");
            console.log(layer._leaflet_id);
        }
    })
} 

//clear all points and path layers
function resetLayers() {
    shelterGroup.clearLayers();
    platformGroup.clearLayers();
}

//function to send query to map/_query to args and build the points map
function rebuildShelters(args) {
    //clear previous points markers
    resetLayers();

    console.log(args);

    $.getJSON('map/_query', args, function(data) {
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
            console.log(ratingsList);
            var avgRating = calculateAvg(ratingsList);
            console.log("Average rating: ", avgRating);

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