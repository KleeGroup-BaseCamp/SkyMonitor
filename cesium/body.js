"use strict";

//var widget = new Cesium.CesiumWidget('cesiumContainer');
var viewer = new Cesium.Viewer('cesiumContainer');
var ellipsoid = viewer.centralBody.getEllipsoid();
var scene = viewer.scene;
var primitives = scene.getPrimitives();
var centralBody = scene.getPrimitives().getCentralBody();
centralBody.depthTestAgainstTerrain = true;
/*
var homeButtonCommand = Cesium.createCommand(function() {
	var destination = Cesium.Cartographic.fromDegrees(2.351944, 48.856667, 15000.0);

	var flight = Cesium.CameraFlightPath.createAnimationCartographic(scene, {
		destination : destination
	});
	scene.getAnimations().add(flight);
});
*/

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

var liveTracking = false;
var DataSourcesBuffer = {};

/*
 * En l'état, displayLive n'efface pas les points s'ils n'apparaissent plus sur FlightRadar (en se basant sur leur key).
 * Autrement dit, si un key devient "désuet", le point correspondant ne sera jamais effacé de viewer.dataSources.
 * En moyenne plus de la moitié des points sont conservés d'une itération sur l'autre, mais les temps restent trop longs.
 */

setInterval(function(){
	if (liveTracking) {
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
}, 3000);

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

Sandcastle.addToolbarButton('myPoints', function() {
	if (!points) {
		request("points");
	} else {
		scene.getPrimitives().removeAll();
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
	liveTracking = !liveTracking;
	viewer.dataSources.removeAll();
});

Sandcastle.finishedLoading();
