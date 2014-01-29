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
		var coll = page.substring(1, page.length);
		console.log(coll);
		dealWithDb(res, coll);
	})

http.createServer(app).listen(200);