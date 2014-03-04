var http = require('http');
var connect = require('connect');
var url = require('url');
var pointsSourceURL = {
	host: 'db.flightradar24.com',
	path: '/zones/full_all.js'
};

/*
 * Ajout d'une méthode setInterval qui stocke toutes les 1500 ms le contenu de full_all.js dans la string Points.
 * À la requête HTTP de body.js, la méthode sendPoints l'envoie telle quelle et le traitement des recoupements se fait dans body.js
 * (cf. commentaires dans body.js pour les points à régler).
 */

var Points = "";

function queryDb(res, coll) {
	var MongoClient = require('mongodb').MongoClient
		, format = require('util').format;

	MongoClient.connect('mongodb://127.0.0.1:27017/db', function(err, db) {
		if(err) throw err;

		var collection = db.collection(coll);
		var query = require('./queries').query(coll);
		var options = require('./queries').options;
		
		collection.find(query, options).toArray(function(err, results) {
			db.close();
			res.end(JSON.stringify(results));
		});
	});
}

setInterval(function() {	
	var myReq = http.get(pointsSourceURL, function(myRes) {
		var bodyChunks = [];
		myRes.on('data', function(chunk) {
			bodyChunks.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(bodyChunks).toString();
			var regExp = /pd_callback.*/;
			var pd_callback = regExp.exec(body)[0];
			Points = pd_callback.substring(12,pd_callback.length-2);
		});
	});

	myReq.on('error', function(e) {
		console.log(e.message);
	});
},2500);

function sendPoints(res) {
	var pointsToSend = JSON.parse(Points);
	pointsToSend.limit = require('./queries').options.limit;
	res.end(JSON.stringify(pointsToSend));
}

function queryFlightRadar(res) {
	var myReq = http.get(pointsSourceURL, function(myRes) {
		var bodyChunks = [];
		myRes.on('data', function(chunk) {
			bodyChunks.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(bodyChunks).toString();
			var newPoints = {};
			try {newPoints = JSON.parse(body.substring(12,body.length-2));}
			catch (e) {console.log("Erreur de parsing.");}
			
			var response = [];
			var count = 0;
			var limit = require('./queries').liveFilter;
			for (var key in newPoints) {
				if (key != "version" && key != "full_count" && count < limit) {
					var point = {
						"type": "Point",
						"coordinates": [
							newPoints[key][2], // Lon
							newPoints[key][1]  // Lat
						],
						"name": key
					};
					response.push(point);
					count++;
				} else {break;}
			}
			res.end(JSON.stringify(response));
		})
	});

	myReq.on('error', function(e) {
		console.log(e.message);
	});
}

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var page = url.parse(req.url).pathname;
		var cmd = page.substring(1, page.length);
		if (cmd == "livePts") {
			//queryFlightRadar(res);
			sendPoints(res);
		} else {
			queryDb(res, cmd);
		}
	})

http.createServer(app).listen(200);