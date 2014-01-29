"use strict";

//var widget = new Cesium.CesiumWidget('cesiumContainer');
var viewer = new Cesium.Viewer('cesiumContainer');

var points = false;
var zones = false;
var routes = false;

function request(type) {
	var xhr_object = null; 

	if(window.XMLHttpRequest) // Firefox 
		xhr_object = new XMLHttpRequest(); 
	else if(window.ActiveXObject) // Internet Explorer 
		xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
	else { // XMLHttpRequest non supporté par le navigateur 
		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
		return; 
	} 

	xhr_object.open("GET", type, true); 
	
	xhr_object.onreadystatechange = function() { 
		if(xhr_object.readyState == 4) {
			display(type, xhr_object.responseText);
		}
	}
	
	xhr_object.send(null); 
}

function display(type, objectString) {
	// (String) type is the name of MongoDB Collection
	var geometriesArray = JSON.parse(objectString);
	
	Sandcastle.declare(display);
	
	var dataSources = new Cesium.DataSourceCollection();
	
	for (var key in geometriesArray) {
		var dataSource = new Cesium.GeoJsonDataSource();
		try {dataSource.load(geometriesArray[key].Geometry);}
		catch (e) {console.log("There are invalid zone geometries!");}
		viewer.dataSources.add(dataSource);
	}
}

Sandcastle.addToolbarButton('myPoints', function() {
	if (!points) {
		request("points");
		Sandcastle.highlight(display);
		points = !points;
	} else {
		viewer.dataSources.removeAll();
		points = !points;
	}
});

Sandcastle.addToolbarButton('myZones', function() {
	if (!zones) {
		request("zones");
		Sandcastle.highlight(display);
		zones = !zones;
	} else {
		viewer.dataSources.removeAll();
		zones = !zones;
	}
});

Sandcastle.addToolbarButton('myRoutes', function() {
	if (!routes) {
		request("airWays");
		Sandcastle.highlight(display);
		routes = !routes;
	} else {
		viewer.dataSources.removeAll();
		routes = !routes;
	}
});

Sandcastle.finishedLoading();
