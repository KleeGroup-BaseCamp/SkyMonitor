/*
Mode d'emploi pour shell mongo :
1. Remplacer <conditions> dans la déclaration de realPoint ci-dessous par des conditions de query mongodb correspondant au point recherché ou déclarez directement le point sous cette forme :
{
	Point: {
		type: "Point",
		coordinates: [<Lon>, <Lat>]
	},
	<autres propriétés>
}
2. Copiez-collez l'intégralité du code dans le shell.
#Mongo exécute
3. Appuyez sur Entrée pour visualiser la liste des _id des zones résultat.

Le résultat est stocké dans myZones.this.
Un rapport des zones faisant erreur est disponible dans myZones.errorReport.
*/

function zoneContainsPtDoc (point, invalidZones, containingZones) {
	return function result (zone) {
		if (point.Alt >= zone.Floor && point.Alt <= zone.Ceiling) {
			try {
				switch(zone.Geometry.type) {
					case "Polygon":
						if (db.points.count({_id:point._id, Point: {$geoWithin: {$geometry: zone.Geometry}}}) != 0) {
							containingZones[point._id].push(zone._id);
						}
						break;
					default:
						if (db.points.count({_id:point._id, Point: {$geoWithin: {$centerSphere: zone.Geometry}}}) != 0) {
							containingZones[point._id].push(zone._id);
						}
				}
			}
			catch (err) {
				invalidZones[zone._id] = err.name;
			}
		}
	}
}

function zonesContainingPts (ptsArray) {
	var invalidZones = {}, containingZones = {};
	ptsArray.forEach(function(point) {
		containingZones[point._id] = [];
		db.zones.find().forEach(zoneContainsPtDoc(point, invalidZones, containingZones));
	});
	var result = {this: containingZones, errorReport: invalidZones};
	return result;
}

var realPtsArray = db.points.find().limit(10).toArray();

var myZones = zonesContainingPts(realPtsArray);

myZones.this;