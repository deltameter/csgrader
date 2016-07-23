//Set up a base path to make require(...) easier
global.__base = __dirname + '/';

//-------------------------------
//Create our web app
//-------------------------------
var express = require('express');
var app = express();
var passport = require('passport');


require('./app/database');
require('./app/passport')(passport);
require('./app/app')(app, passport);
require('./app/router')(app);

//Used for integration tests
module.exports.app = app; 

//-------------------------------
//Create the actual web server
//-------------------------------
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

var port = 3000;
app.set('port', port);

//only use one process for testing or else mocha messes up hard
if (process.env.NODE_ENV === 'test'){
	var server = http.createServer(app);

	server.listen(port);

	console.log('Single server running on port 3000');
}else{
	if (cluster.isMaster) {
		//only the master should preform the interval stuff
		const intervals = require(__base + 'routes/services/intervals');

		// Fork workers.
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', function(worker, code, signal){
			console.log('---------------------------------')
			console.log('worker died: ' + worker.process.pid);
			console.log('---------------------------------')

			setTimeout(function() {
				cluster.fork()
				console.log('---------------------------------')
				console.log('forked dead worker');
				console.log('---------------------------------')
			}, 5000)
		});
	}else{
		var server = http.createServer(app);

		server.listen(port);

		console.log('Worker running on port 3000');
	}
}
