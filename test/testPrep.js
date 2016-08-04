//TEST PROCESS
// 1. Users: userTests.js

'use strict';
process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	app = require('../server').app,
	async = require('async'),
	supertest = require('supertest');


before(function(done){
	mongoose.createConnection(require(__dirname + '/../app/config').mongoURL, function(err){
		if (err) throw err;
		mongoose.connection.db.dropDatabase(function(err){
			if (err) throw err;

			var rebuildIndexes = []

			var models = Object.keys(mongoose.connections[0].base.modelSchemas);

		    models.forEach(function(model){
		    	rebuildIndexes.push(function(cb){
		    		mongoose.model(model).ensureIndexes(function(err){
		    			return cb(err);
		    		})
		    	});
		    });

		    async.parallel(rebuildIndexes, function(err) {
		    	if (err) throw err;
		    	console.log('Dumped database and restored indexes');
		    	done();
		    });
		});
	});
});

module.exports.app = app;
