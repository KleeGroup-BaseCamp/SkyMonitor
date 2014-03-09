"use strict";
Cesium.BingMapsApi.defaultKey = "Aqf4DYbiHt7w-dGnw9-Cp3glX221srHN6q7gDyFvS4q1dOCFfFuShSXyEhz_xrwW";

var viewer = new Cesium.Viewer('cesiumContainer');
var ellipsoid = viewer.centralBody.ellipsoid;
var scene = viewer.scene;
var primitives = scene.primitives;
var centralBody = primitives.centralBody;

var billboards = new Cesium.BillboardCollection();

var liveTracking = "false";
var points = false;
var zones = false;
var routes = false;

var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
	url : 'http://cesiumjs.org/smallterrain',
	credit : 'Terrain data courtesy Analytical Graphics, Inc.'
});

var ellipsoidProvider = new Cesium.EllipsoidTerrainProvider();

var vrTheWorldProvider = new Cesium.VRTheWorldTerrainProvider({
	url : 'http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/',
	credit : 'Terrain data courtesy VT MÄK'
});

var terrainProviders = [
	{ name : 'Flat', provider : ellipsoidProvider },
	{ name : 'VRTheWorldTerrainProvider', provider : vrTheWorldProvider },
	{ name : 'CesiumTerrainProvider', provider : cesiumTerrainProvider }
];

centralBody.terrainProvider = ellipsoidProvider; // Default terrainProvider

createTerrainMenu(terrainProviders);

setInterval(function(){
	if (liveTracking == "true") {
		var xhr_object = null; 

		if(window.XMLHttpRequest) // Firefox 
			xhr_object = new XMLHttpRequest(); 
		else if(window.ActiveXObject) // Internet Explorer 
			xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
		else { // XMLHttpRequest non supporté par le navigateur 
			alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
			return; 
		}
		
		xhr_object.open("GET", "livePts", true); 
		
		xhr_object.onreadystatechange = function() { 
			if(xhr_object.readyState == 4) {
				displayLive(xhr_object.responseText);
			}
		}
		
		xhr_object.send(null); 
	}
}, 5000);

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

Sandcastle.addToolbarButton('myPoints', function() {
	if (!points) {
		request("points");
	} else {
		removeWithoutDestroying(primitives,billboards);
		billboards.removeAll();
	}
	points = !points;
});

Sandcastle.addToolbarButton('myZones', function() {
	if (!zones) {
		request("zones");
	} else {
		viewer.dataSources.removeAll();
	}
	zones = !zones;
});

Sandcastle.addToolbarButton('myRoutes', function() {
	if (!routes) {
		request("airWays");
	} else {
		viewer.dataSources.removeAll();
	}
	routes = !routes;
});

Sandcastle.addToolbarButton('liveTracking', function() {
	if (liveTracking == "false") {
		liveTracking = "true";
	}
	else if (liveTracking == "true") {
		liveTracking = "stopped";
	}
	else { //liveTracking == "stopped"
		liveTracking = "false";
		removeWithoutDestroying(primitives,billboards);
		billboards.removeAll();
	}
});

Sandcastle.finishedLoading();
