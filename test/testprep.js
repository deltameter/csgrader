//TEST PROCESS
// 1. Users: userTests.js


process.env.NODE_ENV = 'test';

var mongoose = require('mongoose'),
	app = require('../server').app,
	supertest = require('supertest');

before(function(done){
	mongoose.createConnection(require(__dirname + '/../app/config').mongoURL, function(err){
		if (err) throw err;
		mongoose.connection.db.dropDatabase(function(err){
			if (err) throw err;
			done();
		});
	});
});

global.assignment = {};
module.exports.app = app;
