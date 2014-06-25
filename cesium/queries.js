exports.query = function(coll) {
	switch(coll) {
		case "points":
			/*return { // France
				Lon: {'$gt': -4.8, '$lt': 8.3},
				Lat: {'$gt': 42.2, '$lt': 51.1},
				Alt: {'$gt': 0}
			};*/
			return {};
		case "zones":
			return {$where: "typeof this.Geometry != Array"};
		case "airWays":
			return {$where: "airWaysSearch(this)"};
	}
};

exports.proj = function(coll) {
	switch(coll) {
		case "points":
			return {
				"Lat":1,
				"Lon":1,
				"Hdg":1,
				"Alt":1,
				"Flight":1,
				"From":1,
				"To":1,
				"Rdr":1
			};
		case "airWays":
			return {
				"Ident": 1,
				"Legs": 1
			}
		default:
			return {};
	}
}

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
			// points
			case "Flight":
			case "From":
			case "To":
			// zones
			case "Name":
			case "Ctry":
			case "Type":
				var optsArray = cmdOptions[key].split(",");
				var optsArrayRegex = [];
				for (var keyArr in optsArray) {
					optsArrayRegex[keyArr] = convertIfRegex(optsArray[keyArr]);
				}
				result[key] = {$in: optsArrayRegex};
				break;
			// points
			case "After":
				var date = new Date(cmdOptions[key]);
				try {
					result.Time.$gte = date.getTime()/1000; // Time in db is in sec
				} catch(e) {
					result.Time = {};
					result.Time.$gte = date.getTime()/1000;
				}
				break;
			case "Before":
				var date = new Date(cmdOptions[key]);
				try {
					result.Time.$lte = date.getTime()/1000;
				} catch(e) {
					result.Time = {};
					result.Time.$lte = date.getTime()/1000;
				}
				break;
			case "Higher":
				try {
					result.Alt.$gt = parseInt(cmdOptions[key]);
				} catch(e) {
					result.Alt = {};
					result.Alt.$gt = parseInt(cmdOptions[key]);
				}
				break;
			case "Lower":
				try {
					result.Alt.$lte = parseInt(cmdOptions[key]);
				} catch(e) {
					result.Alt = {};
					result.Alt.$lte = parseInt(cmdOptions[key]);
				}
				break;
			case "Faster":
				result.Spd = {$gt: parseInt(cmdOptions[key])};
				break;
			default:
				result[key] = cmdOptions[key];
		}
	}
	console.log(result);
	return result;
}

exports.airWaysSearch = function(route) {
	// for (var key in route.Legs) {
		// var From = route.Legs[key].Line.coordinates[0]
		// if (From[0] > -4.8 && From[0] < 8.3 && From[1] > 42.2 && From[1] < 51.1) { // France
			// return true;
		// }
	// }
	// return false;
	return true;
	// return route.Ident == "A1";
}

exports.options = {limit: 100000};
