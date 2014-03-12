function modifyAlpha(color, alpha) {
	return new Cesium.Color(color.red, color.green, color.blue, alpha);
}

function zonesColors(type) {
	var result;
	switch (type) {
		case 'Q': // Danger
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.2));
			break;
		case 'P': // Prohibited
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.4));
			break;
		case 'R': // Restricted
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.4));
			break;
		case 'A':
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DARKORCHID, 0.2));
			break;
		case 'C':
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.4));
			break;
		case 'D':
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.4));
			break;
		case 'E':
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.2));
			break;
		default:
			result = Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.GREEN, 0.4));
	}
	return result;
}

function createTerrainMenu(terrainProviders) {
        var terrainProviderOptions = terrainProviders.map(function(terrainProvider) {
            return {
                text : terrainProvider.name
            };
        });

        Sandcastle.addToolbarMenu(terrainProviderOptions, function() {
			if (altitudeRatio == 10) {
				alert("Attention! Vous êtes en mode altitudes x10 !");
			}
            centralBody.terrainProvider = terrainProviders[this.selectedIndex].provider;
        }, 'terrainMenu');
}

function addPlanesToPrimitives(collection, type) {
	var image = new Image();
	image.onload = function() {
		billboards.removeAll();
		
		var textureAtlas = scene.context.createTextureAtlas({
			image: image
		});
		billboards.textureAtlas = textureAtlas;
		
		var A, B, C, D, errorFactor; // errorFactor corrige Alt dans MongoDB
		if (type == "live") {
			A = 1, B = 2, C = 3, D = 4, errorFactor = 1;
		} else { // type == "database"
			A = 'Lat', B = 'Lon', C = 'Hdg', D = 'Alt', errorFactor = 100;
		}
		
		for (var key in collection) {
			billboards.add({
				imageIndex: 0,
				position: ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(
					collection[key][B],									//Lon
					collection[key][A],									//Lat
					collection[key][D]*altitudeRatio*0.3048/errorFactor	//Alt
				)),
				rotation: -Cesium.Math.toRadians(collection[key][C]),
				alignedAxis: Cesium.Cartesian3.UNIT_Z
			});
		}
	}
	image.src = './plane.gif';
}

function displayLive(objectString) {
	try {
		var newPoints = JSON.parse(objectString);
	} catch (e) {console.log(e.message);}
	delete newPoints.version;
	delete newPoints.full_count;
	
	addPlanesToPrimitives(newPoints, "live");
}

function display(type, objectString) {
	// (String)type is the name of MongoDB Collection
	var geometriesArray = JSON.parse(objectString);
	if (type == "points") {
		addPlanesToPrimitives(geometriesArray, "database");
	}
	else if (type == "airWays") {
		for (var key in geometriesArray) {
			var legs = geometriesArray[key].Legs;
			for (var legKey in legs) {
				var dataSource = new Cesium.GeoJsonDataSource();
				var line = legs[legKey].Line;
				var x = line.coordinates[0][0];
				var y = line.coordinates[0][1];
				try {dataSource.load(line);}
				catch (e) {console.log(e.message);}

				viewer.dataSources.add(dataSource);
			}
		}
	} else {
		var zoneInstances = [];
		for (var key in geometriesArray) {
			var testZoneValidity = false;
			try {testZoneValidity = (geometriesArray[key].Geometry.coordinates[0].length > 3);}
			catch (e) {console.log("There are invalid geometries!");}
			if (testZoneValidity) {
				var degreesPositions = geometriesArray[key].Geometry.coordinates[0];
				var cartographicPositions = [];
				for (var i = 0; i < degreesPositions.length; i++) {
					cartographicPositions.push(Cesium.Cartographic.fromDegrees(
						degreesPositions[i][0],
						degreesPositions[i][1]
					));
				}
				var positions = ellipsoid.cartographicArrayToCartesianArray(cartographicPositions);
				
				var zoneInstance = new Cesium.GeometryInstance({
					geometry: Cesium.PolygonGeometry.fromPositions({
						positions: positions,
						vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
						extrudedHeight: geometriesArray[key].Ceiling*altitudeRatio,
						height: Cesium.Math.sign(geometriesArray[key].Floor)*geometriesArray[key].Floor*altitudeRatio
					}),
					attributes: {
						color: zonesColors(geometriesArray[key].Type)
					},
					id: {
						Name: geometriesArray[key].Nom,
						Type: geometriesArray[key].Type
					}
				});
				zonePrimitive = new Cesium.Primitive({
					geometryInstances : zoneInstance,
					appearance : new Cesium.PerInstanceColorAppearance({
						closed : true
					}),
					releaseGeometryInstances: false // Keeps reference to geometryInstances for picking
				});
				primitives.add(zonePrimitive);
				zonePrimitives.push(zonePrimitive);
			}
		}
	}
}
