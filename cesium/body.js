"use strict";
Cesium.BingMapsApi.defaultKey = "Aqf4DYbiHt7w-dGnw9-Cp3glX221srHN6q7gDyFvS4q1dOCFfFuShSXyEhz_xrwW";

var viewer = new Cesium.Viewer('cesiumContainer');
var scene = viewer.scene;
var globe = scene.globe;
var ellipsoid = globe.ellipsoid;
globe.depthTestAgainstTerrain = false;

var primitives = scene.primitives;

var billboards = new Cesium.BillboardCollection();
primitives.add(billboards);
var polylines = new Cesium.PolylineCollection();
primitives.add(polylines);
var zonePrimitives = [];

var liveTracking = "false";
var points = false;
var routes = false;
var radarCov = false;

/*
 * setInterval asks nodejs for live input: (string)Points in server.js
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
 * 
 * request is also called by the liveTracking button to start & stop node.js collecting live data
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

var field = document.createElement('input');
field.setAttribute('type', 'text');
field.setAttribute('id', "zones");
field.setAttribute('value', "Type JSON query...");
field.onkeypress = function() {
	if (event.keyCode == 13) {
		for (var key in zonePrimitives) {
			primitives.remove(zonePrimitives[key]);
		}
		zonePrimitives = [];
		var cmd = document.getElementById('zones').value;
		if (cmd != "remove") {
			request('zones',JSON.parse(cmd));
		}
	}
}
document.getElementById('toolbar').appendChild(field);

Sandcastle.addToolbarButton('myRoutes', function() {
	if (!routes) {
		request("airWays");
	} else {
		polylines.removeAll();
	}
	routes = !routes;
});

Sandcastle.addToolbarButton('liveTracking', function() {
	if (liveTracking == "false") {
		liveTracking = "true";
		request('livePts', true);
	}
	else if (liveTracking == "true") {
		liveTracking = "stopped";
		request('livePts', false);
	}
	else { //liveTracking == "stopped"
		liveTracking = "false";
		billboards.removeAll();
	}
});

Sandcastle.addToolbarButton('radarCov', function() {
	if (!radarCov) {
		var colors = {}
		for (var i = 0; i < billboards.length; i++) {
			var point = billboards.get(i);
			try {
				point.color = colors[point.id.Rdr];	
			} catch (e) {
				var newColor = new Cesium.Color();
				Cesium.Color.fromRandom({alpha:1}, newColor);
				point.color = newColor;
				colors[point.id.Rdr] = newColor;
			}
		}
	} else {
		for (var i = 0; i < billboards.length; i++) {
			billboards.get(i).color = new Cesium.Color(1, 1, 1, 1);
		}
	}
	radarCov = !radarCov;
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

globe.terrainProvider = ellipsoidProvider; // Default terrainProvider

createTerrainMenu(terrainProviders);

	/*
	 * AltitudeRatio button.
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

/*
 * EVENTS
 *
	 *
	 * LABELS on MouseOver
	 */

var labels = new Cesium.LabelCollection();
var label = labels.add();
primitives.add(labels);

viewer.screenSpaceEventHandler.setInputAction(function(movement) {
	var pickedObject = scene.pick(movement.endPosition);
	if (Cesium.defined(pickedObject)) {
		if (Cesium.defined(pickedObject.primitive.geometryInstances)) { // zone
			label.text =
				pickedObject.primitive.geometryInstances.id.Name + " - " +
				pickedObject.primitive.geometryInstances.id.Type;
		} else if (Cesium.defined(pickedObject.primitive.id.Flight)) { // point
			label.text =
				pickedObject.primitive.id.Flight + " - " +
				pickedObject.primitive.id.From + " - " +
				pickedObject.primitive.id.To + " - " +
				pickedObject.primitive.id.Rdr;
		} else if (Cesium.defined(pickedObject.primitive.id.Type) && pickedObject.primitive.id.Type == "airWay") {
			label.text = pickedObject.primitive.id.Ident;
		}
		var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
		label.position = cartesian;
	} else {
		label.text = '';
	}
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	/*
	 * ACTIONS ON CLICK
	 */

viewer.screenSpaceEventHandler.setInputAction(function(movement) {
	var pickedObject = scene.pick(movement.position);
	if (Cesium.defined(pickedObject)) {
		if (Cesium.defined(pickedObject.primitive.id.Flight)) {
			var flightNo = pickedObject.primitive.id.Flight;
			points = true;
			liveTracking = "false";
			billboards.removeAll();
			request('points', {Flight: flightNo});
		}
		else if (pickedObject.primitive.id.Type == "airWay") {
			var route = [];
			var i = 0;
			while (i < polylines.length) {
				var leg = polylines.get(i);
				if (leg.id.Ident != pickedObject.primitive.id.Ident) {
					polylines.remove(leg);
				}
				else {i++;}
			}
		}
	}
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

Sandcastle.finishedLoading();
