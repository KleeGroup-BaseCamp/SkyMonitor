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

var altitudeRatio = 1; // Default

var log = "";

function newXhrObject() {
	if(window.XMLHttpRequest) { // Firefox 
		return new XMLHttpRequest();}
	else if(window.ActiveXObject) { // Internet Explorer 
		return new ActiveXObject("Microsoft.XMLHTTP");}
	else {
		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
		return;
	}
}
 
function sendLog(log) {
	var xhr_object = newXhrObject();
	xhr_object.open("GET", "log=" + log, true); 
	xhr_object.timeout = 1000;
	xhr_object.send(null);
}
 
/*
 * setInterval asks nodejs for live input: (string)Points in server.js
 */
 
setInterval(function(){
	if (liveTracking == "true") {
		var xhr_object = newXhrObject();
		
		xhr_object.open("GET", "livePts", true); 
		
		xhr_object.onreadystatechange = function() { 
			if(xhr_object.readyState == 4) {
				displayLive(xhr_object.responseText);
			}
		}
		
		xhr_object.send(null); 
	}
}, 3000);

/*
 * request is called by the toolBarButtons and asks nodejs for objects in MongoDB
 * argument (string)type is the name of the MongoDB collection
 * 
 * request is also called by the liveTracking button to start & stop nodejs collecting live data
 */

function request(type, options) {
	var xhr_object = newXhrObject();
	
	var request = {
		type: type,
		options: options
	}
	var stringRequest = JSON.stringify(request);
	
	xhr_object.open("GET", stringRequest, true); 
	
	xhr_object.onreadystatechange = function() { 
		if(xhr_object.readyState == 4) {
			var date = new Date();
			log += 'rnrnResRec:' + date.getTime();
			console.log("Received");
			display(type, xhr_object.responseText);
			date = new Date();
			log += 'rnrnRendered:' + date.getTime();
			sendLog(log);
			log = "";
		}
	}
	
	var date = new Date();
	xhr_object.send(null);
	log += 'rnrnReqSent:' + date.getTime();
}

/*
 * toolbar.js
 */

createToolbar();

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
		} else if (Cesium.defined(pickedObject.primitive.id.Type)
			&& pickedObject.primitive.id.Type == "airWay") {
			label.text = pickedObject.primitive.id.Ident;
		}
		var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
		label.position = cartesian;
	} else {
		label.text = '';
	}
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	/*
	 * ACTIONS on Click
	 */

viewer.screenSpaceEventHandler.setInputAction(function(movement) {
	var pickedObject = scene.pick(movement.position);
	if (Cesium.defined(pickedObject)) {
		
		/*
		 * Plane trace
		 */
		if (Cesium.defined(pickedObject.primitive.id.Flight)) {
			var flightNo = pickedObject.primitive.id.Flight;
			points = true;
			liveTracking = "false";
			billboards.removeAll();
			request('points', {Flight: flightNo});
		}
		
		/*
		 * Keep unique airway
		 */
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
