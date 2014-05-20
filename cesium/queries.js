exports.query = function(coll) {
	if (coll == "points") {
		/*return { // France
			Lon: {'$gt': -4.8, '$lt': 8.3},
			Lat: {'$gt': 42.2, '$lt': 51.1},
			Alt: {'$gt': 0}
		};*/
		return {};
	}
	else if (coll == "zones") {
		return {$where: "typeof this.Geometry != Array"};
	}
	else if (coll == "airWays") {
		return {$where: "airWaysSearch(this)"};
	}
};

function convertIfRegex(regexString) {
	var regex = new RegExp("/.*/.?", "i");
	if (regex.test(regexString)) {
		var queryRegex = new RegExp(regexString.split("/")[1], "i");
		return queryRegex;
	}
	return regexString;
}

exports.prepare = function(coll, cmdOptions) {
	var result = {};
	for (var key in cmdOptions) {
		switch(key) {
			case "Ctry":
			case "Type":
				console.log(key);
				var optsArray = cmdOptions[key].split(",");
				var optsArrayRegex = [];
				for (var keyArr in optsArray) {
					optsArrayRegex[keyArr] = convertIfRegex(optsArray[keyArr]);
				}
				result[key] = {$in: optsArrayRegex};
				break;
			case "Name":
				result.Name = convertIfRegex(cmdOptions.Name);
				break;
			default:
				result[key] = cmdOptions[key];
		}
	}
	console.log(result);
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

exports.options = {limit: 10000};
