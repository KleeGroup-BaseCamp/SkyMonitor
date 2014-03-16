exports.query = function(coll) {
	if (coll == "points") {
		return {
			Lon: {'$gt': -4.8, '$lt': 8.3},
			Lat: {'$gt': 42.2, '$lt': 51.1},
			Alt: {'$gt': 0}
		};
	}
	else if (coll == "zones") {
		return {$where: "typeof this.Geometry != Array"};
	}
	else if (coll == "airWays") {
		return {$where: "airWaysSearch(this)"};
	}
};

exports.prepare = function(coll, cmdOptions) {
	var result = {};
	for (var key in cmdOptions) {
		switch(key) {
			case "Ctry":
				var optsArray = cmdOptions.Ctry.split(",");
				var optsArrayRegex = [];
				for (var key in optsArray) {
					optsArrayRegex[key] = new RegExp(optsArray[key], "i");
				}
				result.Ctry = {$in: optsArrayRegex};
				break;
		}
	}
	return result;
}

exports.airWaysSearch = function(route) {
	for (var key in route.Legs) {
		var From = route.Legs[key].Line.coordinates[0]
		if (From[0] > -4.8 && From[0] < 8.3 && From[1] > 42.2 && From[1] < 51.1) {
			return true;
		}
	}
	return false;
}

exports.options = {limit: 100};
