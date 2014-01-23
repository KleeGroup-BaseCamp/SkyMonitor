"use strict";

//var widget = new Cesium.CesiumWidget('cesiumContainer');
var viewer = new Cesium.Viewer('cesiumContainer');
var mode = viewer;

function request() {
	var xhr_object = null; 

	if(window.XMLHttpRequest) // Firefox 
		xhr_object = new XMLHttpRequest(); 
	else if(window.ActiveXObject) // Internet Explorer 
		xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
	else { // XMLHttpRequest non supporté par le navigateur 
		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
		return; 
	} 

	xhr_object.open("GET", "qPoints", true); 
	
	xhr_object.onreadystatechange = function() { 
		if(xhr_object.readyState == 4) {
			myPoints(xhr_object.responseText);
		}
	}
	
	xhr_object.send(null); 
}

function myPoints(pointString) {
	var point = eval('(' + pointString + ')').Point;

	Sandcastle.declare(myPoints);

	viewer.dataSources.removeAll();

	var dataSource = new Cesium.GeoJsonDataSource();
	dataSource.load(point).then(function() {
		viewer.dataSources.add(dataSource);
		viewer.homeButton.viewModel.command();
	});
}

Sandcastle.addToolbarButton('myPoints', function() {
	request();
	Sandcastle.highlight(myPoints);
});

Sandcastle.finishedLoading();
