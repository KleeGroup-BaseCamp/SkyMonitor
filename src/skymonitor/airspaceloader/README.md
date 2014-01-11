#airSpaceLoader

##Zones JSON data format :
For the precise description of each field please visit http://www.winpilot.com/usersguide/userairspace.asp
	{
		Type: (String) "R" , // Zone class (Open Air AC)
		Nom: (String) "R217/2 RHONE (RHONE 127.92)", // Zone name (AN)
		Ceiling: (int) 19500, // Zone ceiling (AH)
		Floor: (int) 0, // Negative if AGL, positive if AMSL. SFC = 0. Zone floor (AH)
		Geometry: {
		// if polygon:
			type: "Polygon",
			coordinates: (double[][][]) [[[Lon1,Lat1],[Lon2,Lat2]...]] // see GeoJSON data format
		//if circle (Open Air object is DC) :
			[(double[][]) [centerLon,centerLat], (double) radius] // radius in radians, equal to real surface radius/ earth radius
		},
		// if real polygon contains arcs (Open Air shape portions are DA or DB):
		Arcs:
			[
				{
					center: (GeoJSON Object) // center in GeoJSON format
					radius: (int) 4, // radius in nautical miles
					start: (double) 126 // arc start angle in degrees, from the North direction, clockwise
					stop: (double) 360 // arc stop angle in degrees, from the North direction, clockwise
				},
				{
					...
				}
			],
		Pays: (String) "Fr" // country
	}
