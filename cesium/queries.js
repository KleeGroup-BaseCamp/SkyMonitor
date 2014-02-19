exports.query = function(coll) {
	if (coll == "points") {
		return {
			Lon: {'$gt': -4.8, '$lt': 8.3},
			Lat: {'$gt': 42.2, '$lt': 51.1}
		};
	}
	else if (coll == "zones") {
		return {$where: "typeof this.Geometry != Array"};
	}
	else if (coll == "airWays") {
		return {Ident: "A10"};
	}
};

exports.liveFilter = 20;

exports.options = {limit: 2};