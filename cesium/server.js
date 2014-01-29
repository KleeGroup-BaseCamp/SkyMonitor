var http = require('http');
var connect = require('connect');
var url = require('url');

function dealWithDb(res, coll) {
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

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var page = url.parse(req.url).pathname;
		var cmd = page.substring(1, page.length);
		if (cmd == "livePts") {
			var options = {
				host: 'db.flightradar24.com',
				path: '/zones/full_all.js'
			};

			var myReq = http.get(options, function(myRes) {
				// Buffer the body entirely for processing as a whole.
				var bodyChunks = [];
				myRes.on('data', function(chunk) {
					bodyChunks.push(chunk);
				}).on('end', function() {
					var body = Buffer.concat(bodyChunks).toString();
					var object = {};
					var response = [];
					try {object = JSON.parse(body.substring(12,body.length-2));}
					catch (e) {}
					var count = 0;
					for (var key in object) {
						if (key != "version" && key != "full_count" && count < 500) {
							var point = {
								"type": "Point",
								"coordinates": [
									object[key][2],
									object[key][1]
								]
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
		} else {
			dealWithDb(res, cmd);
		}
	})

http.createServer(app).listen(200);