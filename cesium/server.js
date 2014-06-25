var http = require('http');
var connect = require('connect');
var url = require('url');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var assert = require('assert');
var fs = require('fs');
var extend = require('util')._extend;

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
	var options = extend({},queries.options);
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
		fs.appendFile('log.txt','Data:' + coll + '\r\n');
		fs.appendFile('log.txt','QuerDB:' + date.getTime() + '\r\n');
		collection.find(query, proj, options).toArray(function(err, results) {
			console.log("Got results");
			date = new Date();
			fs.appendFile('log.txt','DataRec:' + date.getTime() + '\r\n');
			fs.appendFile('log.txt','Results:' + results.length + '\r\n');
			db.close();
			console.log("Will stringify");
			var stringified = JSON.stringify(results);
			console.log("Stringified");
			res.end(stringified);
			date = new Date();
			fs.appendFile('log.txt','ResSent:' + date.getTime() + '\r\n');
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
			fs.appendFile('log.txt', cmd.replace("log=","").replace(/rnrn/g,"\r\n"));
		}
		else if (cmd != "favicon.ico") {
			var cmdModif = cmd.replace(/%7B/g,"{").replace(/%7D/g,"}").replace(/%22/g,"\u0022").replace(/%5E/g,"\u005E");
			var cmdObj = JSON.parse(cmdModif);
			if (cmdObj.type == 'livePts') { // liveTracking status, true or false: starts & stops node getting live points
				liveTracking = cmdObj.options;
			} else {
				fs.appendFile('log.txt','#\r\nReqRec:' + date.getTime() + '\r\n');
				queryDb(res, cmdObj.type, cmdObj.options);
			}
		}
	});

http.createServer(app).listen(1337);
