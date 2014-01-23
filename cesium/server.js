var http = require('http');
var connect = require('connect');
var url = require('url');

function dealWithDb(res) {
	var MongoClient = require('mongodb').MongoClient
		, format = require('util').format;

	MongoClient.connect('mongodb://127.0.0.1:27017/db', function(err, db) {
		if(err) throw err;

		var collection = db.collection('points');
		
		collection.findOne(function(err, results) {
			console.dir(results);
			db.close();
			res.end(JSON.stringify(results))
		});
	});
}

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var page = url.parse(req.url).pathname;
		console.log(page);
		if (page == '/qPoints') {
			dealWithDb(res)
		}
	})

http.createServer(app).listen(200);