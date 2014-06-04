var http = require('http');
var connect = require('connect');
var url = require('url');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var assert = require('assert');
var fs = require('fs');

var queries = require('./queries.js');
var pointsSourceURL = require('./pointsSourceURL.js').options;

var db = new Db('db', new Server('localhost', 27017), {safe: false});

var Points = "";
var liveTracking = false;

db.open(function (err, db) {
	assert.equal(null, err);

	var collection = db.collection('system.js');
	var airWaysSearch = queries.airWaysSearch;
	collection.remove({_id: "airWaysSearch"}, function (err, nbOfDocs) {
		collection.insert({_id: "airWaysSearch", value: airWaysSearch}, {serializeFunctions: true}, function (err, result) {
			db.close();
		});
	});
});

function queryDb(res, coll, cmdOptions) {
	var options = queries.options;
	if (typeof cmdOptions !== 'undefined' && typeof cmdOptions.Limit !== 'undefined') {
		options.limit = cmdOptions.Limit;
		delete cmdOptions.Limit;
	}
	
	var mongoCmdOpts = queries.prepare(coll, cmdOptions);
	
	db.open(function (err, db) {
		assert.equal(null, err);
		
		var collection = db.collection(coll);
		var query = queries.query(coll);
		for (var key in mongoCmdOpts) {
			query[key] = mongoCmdOpts[key];
		}
		var proj = queries.proj(coll);
		
		var date = new Date();
		fs.appendFile('log.txt','\r\nData:' + coll);
		fs.appendFile('log.txt','\r\nQuerDB:' + date.getTime());
		collection.find(query, proj, options).toArray(function(err, results) {
			console.log("Got results");
			date = new Date();
			fs.appendFile('log.txt','\r\nDataRec:' + date.getTime());
			fs.appendFile('log.txt','\r\nResults:' + results.length);
			db.close();
			console.log("Will stringify");
			var stringified = JSON.stringify(results);
			console.log("Stringified");
			res.end(stringified);
			date = new Date();
			fs.appendFile('log.txt','\r\nResSent:' + date.getTime());
		});
	});
}

setInterval(function() {
	if (liveTracking) {
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
	}
},2500);

var app = connect()
	.use(connect.static(__dirname))
	.use(function(req, res){
		var date = new Date();
		var page = url.parse(req.url).pathname;
		var cmd = page.substring(1, page.length);
		if (cmd == "livePts") { // Timer request
			res.end(Points);
		}
		else if (cmd.substring(0,4) == "log=") {
			fs.appendFile('log.txt', cmd.replace("log=","").replace(/rnrn/g,"\r\n") + '\r\n');
		} else {
			var cmdModif = cmd.replace(/%7B/g,"{").replace(/%7D/g,"}").replace(/%22/g,"\u0022").replace(/%5E/g,"\u005E");
			var cmdObj = JSON.parse(cmdModif);
			if (cmdObj.type == 'livePts') { // liveTracking status, true or false: starts & stops node getting live points
				liveTracking = cmdObj.options;
			} else {
				fs.appendFile('log.txt','#\r\nReqRec:' + date.getTime());
				queryDb(res, cmdObj.type, cmdObj.options);
			}
		}
	});

http.createServer(app).listen(1337);
