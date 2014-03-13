var http = require('http');
var connect = require('connect');
var url = require('url');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var assert = require('assert');
var pointsSourceURL = {
	host: 'db.flightradar24.com',
	path: '/zones/full_all.js'
};
var db = new Db('db', new Server('localhost', 27017), {safe: false});

var Points = "";

db.open(function (err, db) {
	assert.equal(null, err);

	var collection = db.collection('system.js');
	var airWaysSearch = require('./queries.js').airWaysSearch;
	collection.remove({_id: "airWaysSearch"}, function (err, nbOfDocs) {
		collection.insert({_id: "airWaysSearch", value: airWaysSearch}, {serializeFunctions: true}, function (err, result) {
			db.close();
		});
	});
});

function queryDb(res, coll) {
	db.open(function (err, db) {
		assert.equal(null, err);

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

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var page = url.parse(req.url).pathname;
		var cmd = page.substring(1, page.length);
		console.log(cmd);
		if (cmd == "livePts") {
			res.end(Points);
		} else {
			queryDb(res, cmd);
		}
	})

http.createServer(app).listen(1337);
