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

function display(type, objectString) {
	// (String) type is the name of MongoDB Collection
	var geometriesArray = JSON.parse(objectString);
	
	var dataSources = new Cesium.DataSourceCollection();
	
	if (type == "points") {
		var image = new Image();
        image.onload = function() {
			var billboards = new Cesium.BillboardCollection();
			
			var textureAtlas = scene.getContext().createTextureAtlas({
                image : image
            });
            billboards.setTextureAtlas(textureAtlas);
			
			for (var key in geometriesArray) {
				billboards.add({
					imageIndex: 0,
					position: ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(
						geometriesArray[key].Lon,
						geometriesArray[key].Lat,
						geometriesArray[key].Alt*0.3048/100 // Le /100 n'est dû qu'à une erreur dans l'enregistrement des points.
					))										// Le code dataCollector est maintenant corrigé mais dans mongoDb ils sont tjs faux.
				});
			}
			scene.getPrimitives().add(billboards);
		}
		image.src = './Apps/Sandcastle/images/facility.gif';
	}
	else if (type == "airWays") {
		for (var key in geometriesArray) {
			var legs = geometriesArray[key].Legs;
			console.log(geometriesArray[key].Ident);
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
			var dataSource = new Cesium.GeoJsonDataSource();
			try {dataSource.load(geometriesArray[key].Geometry);}
			catch (e) {console.log("There are invalid zone geometries!");}
			viewer.dataSources.add(dataSource);
		}
	}
}
