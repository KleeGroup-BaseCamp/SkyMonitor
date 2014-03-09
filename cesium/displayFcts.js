function createTerrainMenu(terrainProviders) {
        var terrainProviderOptions = terrainProviders.map(function(terrainProvider) {
            return {
                text : terrainProvider.name
            };
        });

        Sandcastle.addToolbarMenu(terrainProviderOptions, function() {
            centralBody.terrainProvider = terrainProviders[this.selectedIndex].provider;
        }, 'terrainMenu');
}

function cloneBillboardCollection(origin) {
	var buffer = new Cesium.CompositePrimitive();
	buffer.add(origin);
	var copy = buffer.get(origin);
	return copy;
}

function removeWithoutDestroying(CompositePrimitive, BillboardCollection) {
	var buffer = cloneBillboardCollection(BillboardCollection);
	CompositePrimitive.remove(buffer);
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
					collection[key][B],						//Lon
					collection[key][A],						//Lat
					collection[key][D]*0.3048/errorFactor	//Alt
				)),
				rotation: -Cesium.Math.toRadians(collection[key][C]),
				alignedAxis: Cesium.Cartesian3.UNIT_Z
			});
		}
		primitives.add(billboards);
	}
	image.src = './plane.gif';
}

function displayWithBillboard(newPoints) {
	removeWithoutDestroying(primitives,billboards);
	addPlanesToPrimitives(newPoints, "live");
}

function displayLive(objectString) {
	var newPoints = JSON.parse(objectString);
	delete newPoints.version;
	delete newPoints.full_count;
	
	displayWithBillboard(newPoints);
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
				if (x > -4.8 && x < 8.3 && y > 42.2 && y < 51.1) {
					try {dataSource.load(line);}
					catch (e) {console.log(e.message);}
				}
				viewer.dataSources.add(dataSource);
			}
		}
	} else {
		for (var key in geometriesArray) {
			var testZoneValidity = false;
			try {testZoneValidity = (geometriesArray[key].Geometry.coordinates[0].length > 3);}
			catch (e) {console.log("There are invalid zone geometries!");}
			if (testZoneValidity) {
				var dataSource = new Cesium.GeoJsonDataSource();
				try {dataSource.load(geometriesArray[key].Geometry);}
				catch (e) {console.log("There are invalid zone geometries!");}
				viewer.dataSources.add(dataSource);
			}
		}
	}
}
