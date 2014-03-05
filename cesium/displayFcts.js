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

function selectiveDisplay(newPoints) {
	var counter = newPoints.limit;
	delete newPoints.limit;
	for (var key in newPoints) {
		if (counter > 0) {
			var newLon = newPoints[key][2]
				, newLat = newPoints[key][1];
			if (key in DataSourcesBuffer
				&& (newPoints[key][10] == DataSourcesBuffer[key][10]
					|| (newLon == DataSourcesBuffer[key][2] && newLat == DataSourcesBuffer[key][1]))) {}
			else {
				try {viewer.dataSources.remove(DataSourcesBuffer[key][18]);}
				catch (e) {}
				
				var dataSource = new Cesium.GeoJsonDataSource();
				var newPoint = {
					'type': "Point",
					'coordinates': [newLon, newLat]
				}
				dataSource.load(newPoint);
				newPoints[key].push(dataSource); // newPoints[key][18] == dataSource
				DataSourcesBuffer[key] = newPoints[key];
				
				viewer.dataSources.add(dataSource);
				counter--;
			}
		} else {break;}
	}
}

function displayWithBillboard(newPoints) {
	removeWithoutDestroying(primitives,billboards);
	
	var image = new Image();
	image.onload = function() {
		billboards.removeAll();
		
		var textureAtlas = scene.context.createTextureAtlas({
			image: image
		});
		billboards.textureAtlas = textureAtlas;
		
		for (var key in newPoints) {
			billboards.add({
				imageIndex: 0,
				position: ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(
					newPoints[key][2],			//Lon
					newPoints[key][1],			//Lat
					newPoints[key][4]*0.3048	//Alt
				))
			});
		}
		primitives.add(billboards);
	}
	image.src = './plane.gif';
}

function displayLive(objectString) {
	var newPoints = JSON.parse(objectString);
	delete newPoints.version;
	delete newPoints.full_count;
	
	//selectiveDisplay(newPoints);
	displayWithBillboard(newPoints);
}

function display(type, objectString) {
	// (String)type is the name of MongoDB Collection
	var geometriesArray = JSON.parse(objectString);
	
	if (type == "points") {
		var image = new Image();
        image.onload = function() {
			billboards.removeAll();
			
			var textureAtlas = scene.context.createTextureAtlas({
                image: image
            });
            billboards.textureAtlas = textureAtlas;
			
			for (var key in geometriesArray) {
				billboards.add({
					imageIndex: 0,
					position: ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(
						geometriesArray[key].Lon,
						geometriesArray[key].Lat,
						geometriesArray[key].Alt*0.3048/100 // Le /100 n'est dû qu'à une erreur dans l'enregistrement des points
					))										// (ils sont en pieds*100 dans mongoDB).
				});											// Le code dataCollector est maintenant corrigé mais dans mongoDb ils sont tjs faux.
			}
			primitives.add(billboards);
		}
		image.src = './plane.gif';
	}
	else if (type == "airWays") {
		for (var key in geometriesArray) {
			var legs = geometriesArray[key].Legs;
			for (var legKey in legs) {
				var dataSource = new Cesium.GeoJsonDataSource();
				try {
					dataSource.load(legs[legKey].Line);
				}
				catch (e) {console.log(e.message);}
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
