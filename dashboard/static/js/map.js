
//dictionary for storing query params and values
    var sel_args = {
        manager : "",
        region : "",
        repair : "",
        start : "",
        end : ""
    }

    //query args for max station
    var max_sel_args = {
        inspector: "",
        crew : "",
        wash : "",
        csv : "",
        start : "",
        end : ""
    }

    //create layer to store all bus shelter points
    var shelterGroup = new L.FeatureGroup();
    //create group layer for MAX platform points
    var platformGroup = new L.FeatureGroup();
    //create boundary geojson layergroup
    var boundaryLayer = new L.FeatureGroup();
    var pointGroup = new L.FeatureGroup();
    //TriMet service boundary
     var tmLayer = "tm_fill.geojson";
     var maxLayer = "max_stations.geojson";
    //create an array list for storing ratings for each shelter
    var ratingsList = [];

    //dictionary for storing popup content
    var popupDict = {};
    //dictionary for storing average rating for stations
    var ratingsDict = {};

    var hasLegend = false;
    var highLight = null;
    var selected;
    var pathstyle = {
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
    var stationStyle = {
                clickable: true,
                fillColor: "#259CEF",
                radius: 10,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.6
    };


//initialize map 
$(document).ready(function() {
    mymap = L.map('mapid', {scrollWheelZoom:true}).setView([45.48661, -122.65343], 10);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG11c2VyMTk3IiwiYSI6ImNpc254cHk1YTA1dngydm14bjkyamQ1NmsifQ.8ya7T1hHXtVmYOwMrVIuFw', {
    attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>',
    id: 'mapbox.light',
    maxZoom: 18,
    minZoom: 10
    }).addTo(mymap);
    console.log(mymap);

        //set mapview checkbox for bus shelter true
    $('input.checkview')[0].checked = true;
    //set mapview checkboxes for MAX platform false
    $('input.checkview')[1].checked = false;
    $('table#bus-menu-table').show();
    $('table#max-menu-table').hide();

    $("input[type='checkbox']").change(
        function() {
            $('input[type="checkbox"]').not(this).prop('checked', false);
            if ($('input.checkview')[0].checked) {
                //clear layers
                resetLayers();
                removeLayers(mymap);
                $('table#bus-menu-table').show();
                $('table#max-menu-table').hide();
                addBoundaryLayer(tmLayer);
                rebuildShelters(sel_args);
            } else {
                //clear and reset layers
                resetLayers();
                $('table#bus-menu-table').hide();
                $('table#max-menu-table').show();
                removeLayers(mymap);
                addBoundaryLayer(tmLayer);
                addPointLayer(maxLayer);
                rebuildPlatform(max_sel_args, maxLayer, addPointLayer);
            }
        });

    //load map with markers on initial page load with no filter params
    //rebuildShelters(sel_args);

    //call toggle div function
    toggle_tb();

    //load calendar
    loadCalendar();

    //add TriMet boundary
    addBoundaryLayer(tmLayer);

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
        addBoundaryLayer(tmLayer);
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
        addBoundaryLayer(tmLayer);

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
        addBoundaryLayer(tmLayer);

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

