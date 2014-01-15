var connect = require('connect');
connect.createServer(
	require(['Cesium'], function(Cesium) {
	    "use strict";

	    var gallery = 'http://cesiumjs.org/Cesium/Apps/CesiumViewer/Gallery/Vehicle.czml';


	    function czmlVehicle() {
	        Sandcastle.declare(czmlVehicle); // For highlighting in Sandcastle.

	        viewer.dataSources.removeAll();

	        var czmlDataSource = new Cesium.CzmlDataSource();
	        czmlDataSource.loadUrl(gallery + 'Vehicle.czml').then(function() {
	            viewer.dataSources.add(czmlDataSource);
	            viewer.homeButton.viewModel.command();
	        });
	    }

	    var builtInCzml = [{
	        "id" : "Vehicle",
	        "availability" : "2012-08-04T16:00:00Z/2012-08-04T17:04:54.9962195740191Z",
	        "billboard" : {
	            "eyeOffset" : {
	                "cartesian" : [0.0, 0.0, 0.0]
	            },
	            "horizontalOrigin" : "CENTER",
	            "image" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEISURBVEhLvVXBDYQwDOuojHKj8LhBbpTbpBCEkZsmIVTXq1RVQGrHiWlLmTTqPiZBlyLgy/KSZQ5JSHDQ/mCYCsC8106kDU0AdwRnvYZArWRcAl0dcYJq1hWCb3hBrumbDAVMwAC82WoRvgMnVMDBnB0nYZFTbE6BBvdUGqVqCbjBIk3PyFFR/NU7EKzru+qZsau3ryPwwCRLKYOzutZuCL6fUmWeJGzNzL/RxAMrUmASSCkkAayk2IxPlwhAAYGpsiHQjbLccfdOY5gKkCXAMi7SscAwbQpAnKyctWyUZ6z8ja3OGMepwD8asz+9FnSvbhU8uVOHFIwQsI3/p0CfhuqCSQuxLqsN6mu8SS+N42MAAAAASUVORK5CYII=",
	            "pixelOffset" : {
	                "cartesian2" : [0.0, 0.0]
	            },
	            "scale" : 0.8333333333333334,
	            "show" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "boolean" : true
	            }],
	            "verticalOrigin" : "BOTTOM"
	        },
	        "label" : {
	            "fillColor" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "rgba" : [255, 255, 0, 255]
	            }],
	            "font" : "bold 10pt Segoe UI Semibold",
	            "horizontalOrigin" : "LEFT",
	            "outlineColor" : {
	                "rgba" : [0, 0, 0, 255]
	            },
	            "pixelOffset" : {
	                "cartesian2" : [10.0, 0.0]
	            },
	            "scale" : 1.0,
	            "show" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "boolean" : true
	            }],
	            "style" : "FILL",
	            "text" : "Vehicle",
	            "verticalOrigin" : "CENTER"
	        },
	        "path" : {
	            "color" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "rgba" : [255, 255, 0, 255]
	            }],
	            "outlineWidth" : 0.0,
	            "width" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "number" : 5.0
	            }],
	            "show" : [{
	                "interval" : "2012-08-04T16:00:00Z/2012-08-04T18:00:00Z",
	                "boolean" : true
	            }]
	        },
	        "position" : {
	            "interpolationAlgorithm" : "LAGRANGE",
	            "interpolationDegree" : 1,
	            "epoch" : "2012-08-04T16:00:00Z",
	            // Trimmed to just 2 points
	            "cartesian" : [0.0, -2379754.6637012, -4665332.88013588, 3628133.68924173,
	                           3894.996219574019, -2291336.52323822, -4682359.21232197, 3662718.52171165]
	        }
	    }];


	    var viewer = new Cesium.Viewer('cesiumContainer');
	    viewer.extend(Cesium.viewerDynamicObjectMixin);


	    Sandcastle.addToolbarButton('Vehicle', function() {
	        czmlVehicle();
	        Sandcastle.highlight(czmlVehicle);
	    });


	    Sandcastle.finishedLoading();
	})
).listen(8080);







