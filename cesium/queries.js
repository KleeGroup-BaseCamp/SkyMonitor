exports.query = function(coll) {
	if (coll == "points") {
		return {
			Lon: {'$gt': -4.8, '$lt': 8.3},
			Lat: {'$gt': 42.2, '$lt': 51.1},
			Alt: {'$gt': 0}
		};
	}
	else if (coll == "zones") {
		return {$where: "typeof this.Geometry != Array", Nom: /paris/i, Ceiling: {$lt: 10000}};
	}
	else if (coll == "airWays") {
		return {$where: "airWaysSearch(this)"};
	}
};

exports.airWaysSearch = function(route) {
	var result = false;
	for (var key in route.Legs) {
		var From = route.Legs[key].Line.coordinates[0]
		if (From[0] > -4.8 && From[0] < 8.3 && From[1] > 42.2 && From[1] < 51.1) {
			result = true;
			break;
		}
	}
	return result;
}

exports.options = {limit: 100};
