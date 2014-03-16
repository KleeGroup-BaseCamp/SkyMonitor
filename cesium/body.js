"use strict";
Cesium.BingMapsApi.defaultKey = "Aqf4DYbiHt7w-dGnw9-Cp3glX221srHN6q7gDyFvS4q1dOCFfFuShSXyEhz_xrwW";

var viewer = new Cesium.Viewer('cesiumContainer');
var ellipsoid = viewer.centralBody.ellipsoid;
var scene = viewer.scene;
var primitives = scene.primitives;
var centralBody = primitives.centralBody;

var billboards = new Cesium.BillboardCollection();
primitives.add(billboards);
var zonePrimitives = [];

var liveTracking = "false";
var points = false;
var zones = false;
var routes = false;

/*
 * setInterval asks nodejs for live input : (string)Points in server.js
 */

setInterval(function(){
	if (liveTracking == "true") {
		var xhr_object = null; 

		if(window.XMLHttpRequest) // Firefox 
			xhr_object = new XMLHttpRequest(); 
		else if(window.ActiveXObject) // Internet Explorer 
			xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
		else {
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

/*
 * request is called by the toolBarButtons and asks nodejs for objects in MongoDB
 * argument (string) <type> is the name of the MongoDB collection
 */

function request(type, options) {
	var xhr_object = null; 

	if(window.XMLHttpRequest) // Firefox 
		xhr_object = new XMLHttpRequest(); 
	else if(window.ActiveXObject) // Internet Explorer 
		xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
	else {
		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
		return; 
	}
	
	var request = {
		type: type,
		options: options
	}
	var stringRequest = JSON.stringify(request);
	
	xhr_object.open("GET", stringRequest, true); 
	
	xhr_object.onreadystatechange = function() { 
		if(xhr_object.readyState == 4) {
			display(type, xhr_object.responseText);
		}
	}
	
	xhr_object.send(null); 
}

/*
 * TOOLBAR BUTTONS
 */

Sandcastle.addToolbarButton('myPoints', function() {
	if (!points) {
		request("points");
	} else {
		billboards.removeAll();
	}
	points = !points;
});

/*Sandcastle.addToolbarButton('myZones', function() {
	if (!zones) {
		request("zones");
	} else {
		for (var key in zonePrimitives) {
			primitives.remove(zonePrimitives[key]);
		}
		zonePrimitives = [];
	}
	zones = !zones;
});*/

var field = document.createElement('input');
field.setAttribute('type', 'text');
field.setAttribute('id', "zones");
field.setAttribute('value', "Ctry: Fr, UK, US");
field.onkeypress = function() {
	if (event.keyCode == 13) {
		for (var key in zonePrimitives) {
			primitives.remove(zonePrimitives[key]);
		}
		zonePrimitives = [];
		var cmd = document.getElementById('zones').value;
		if (cmd != "remove") {
			request('zones',{Ctry:cmd});
		}
	}
}
document.getElementById('toolbar').appendChild(field);

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
		billboards.removeAll();
	}
});

	/*
	 * Terrain Button
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

	/*
	 * AltitudeRation button.
	 * Default = 1, sets the ratio that multiplies every altitude for better visualization
	 */

var altitudeRatio = 1; // Default

var altitudes = [
	{name: 'Real Altitude', ratio: 1},
	{name: 'x10', ratio: 10}
]

var altitudeOptions = altitudes.map(function(altitude) {
	return {
		text : altitude.name
	};
});

Sandcastle.addToolbarMenu(altitudeOptions, function() {
	altitudeRatio = altitudes[this.selectedIndex].ratio;
}, 'terrainMenu');

var labels = new Cesium.LabelCollection();
var label = labels.add();
primitives.add(labels);

/*
 * LABELS on MouseOver
 */

viewer.screenSpaceEventHandler.setInputAction(function(movement) {
	var pickedObject = scene.pick(movement.endPosition);
	if (Cesium.defined(pickedObject)) {
		label.setText(
			pickedObject.primitive.geometryInstances.id.Name + " - " +
			pickedObject.primitive.geometryInstances.id.Type
		);
		var cartesian = scene.camera.controller.pickEllipsoid(movement.endPosition, ellipsoid);
		label.setPosition(cartesian);
	} else {
		label.setText('');
	}
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

Sandcastle.finishedLoading();
