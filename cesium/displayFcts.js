function modifyAlpha(color, alpha) {
	return new Cesium.Color(color.red, color.green, color.blue, alpha);
}

function zonesColors(type) {
	switch (type) {
		case 'Q': // Danger
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.2));
		case 'P': // Prohibited
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.4));
		case 'R': // Restricted
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.RED, 0.4));
		case 'A':
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DARKORCHID, 0.2));
		case 'C':
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.4));
		case 'D':
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.4));
		case 'E':
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.DODGERBLUE, 0.2));
		default:
			return Cesium.ColorGeometryInstanceAttribute.fromColor(modifyAlpha(Cesium.Color.GREEN, 0.4));
	}
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
            globe.terrainProvider = terrainProviders[this.selectedIndex].provider;
        }, 'terrainMenu');
}

function addPlanesToPrimitives(collection, type) {
	var image = new Image();
	image.onload = function() {
		billboards.removeAll();
		
		var textureAtlas = scene.createTextureAtlas({
			image: image
		});
		billboards.textureAtlas = textureAtlas;
		
		var A, B, C, D, E, F, G, H;
		if (type == "livePts") {
			A = 1, B = 2, C = 3, D = 4, E = 13, F = 11, G = 12, H = 7;
		} else { // type == "points"
			A = 'Lat', B = 'Lon', C = 'Hdg', D = 'Alt', E = 'Flight', F = 'From', G = 'To', H = 'Rdr';
		}
		
		for (var key in collection) {
			billboards.add({
				imageIndex: 0,
				position: ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(
					collection[key][B],						//Lon
					collection[key][A],						//Lat
					collection[key][D]*altitudeRatio*0.3048	//Alt
				)),
				rotation: -Cesium.Math.toRadians(collection[key][C]),
				alignedAxis: Cesium.Cartesian3.UNIT_Z,
				id: {
					Flight: collection[key][E],
					From: collection[key][F],
					To: collection[key][G],
					Rdr: collection[key][H]
				}
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
	
	addPlanesToPrimitives(newPoints, "livePts");
}

function scrollSegments(position, segments, polylinePoints) {
	for (var i = 0; i < segments.length; i++) {
		if (segments[i][1].toString() == position.toString()) {
			segments[i].reverse();
		}
		if (segments[i][0].toString() == position.toString()) {
			var newPos = segments[i][1];
			polylinePoints.unshift(newPos);
			segments.splice(i,1);
			return newPos;
		}
	}
	polylinePoints.reverse();
	return "reversed";
}

function display(type, objectString) {
	// (String)type is the name of MongoDB Collection
	var geometriesArray = JSON.parse(objectString);
	switch (type) {
		case "points":
			addPlanesToPrimitives(geometriesArray, type);
			break;
		case "airWays":
			for (var key in geometriesArray) {
				var legs = geometriesArray[key].Legs;
				
				var segments = [];
				for (var legKey in legs) {
					segments.push(legs[legKey].Line.coordinates)
				}
				
				while (segments.length > 0) {
					var polylinePoints = [];
					var pos = segments[0][0];
					polylinePoints[0] = segments[0][0];
					polylinePoints[1] = segments.shift()[1];
					
					while (pos != "reversed") {
						pos = scrollSegments(pos, segments, polylinePoints);
					}
					pos = polylinePoints[0];
					while (pos != "reversed") {
						pos = scrollSegments(pos, segments, polylinePoints);
					}
					
					var polylinePos = [];
					for (var i = 0; i < polylinePoints.length; i++) {
						polylinePos.push(new Cesium.Cartographic.fromDegrees(polylinePoints[i][0], polylinePoints[i][1]));
					}
					
					polylines.add({
						positions: ellipsoid.cartographicArrayToCartesianArray(polylinePos),
						material: Cesium.Material.fromType('Color', {
							color : Cesium.Color.WHITE
						}),
						id: {
							Ident: geometriesArray[key].Ident,
							Type: "airWay"
						}
					});
				}
			}
			break;
		case "zones":
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
							Name: geometriesArray[key].Name,
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
			break;
	}
}
