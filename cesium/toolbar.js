function createToolbar() {

	Sandcastle.addToolbarButton('myPoints', function() {
		if (!points) {
			request("points");
		} else {
			billboards.removeAll();
		}
		points = !points;
	});

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
			var colors = {};
			for (var i = 0; i < billboards.length; i++) {
				var point = billboards.get(i);
				if (Cesium.defined(colors[point.id.Rdr])) {
					point.color = colors[point.id.Rdr];
				}
				else {
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
	 * advancedToolbar.js
	 */
		 
	createDDMenu();

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
}
