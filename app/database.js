'use strict';

var mongoose = require('mongoose'),
	fs = require('fs'),
	config = require('./config'),
	models_path = __base + 'models/',
	connection = mongoose.createConnection(require(__base + 'app/config').mongoURL),
	autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(connection);

require(models_path + 'question')();
require(models_path + 'exercise')();
require(models_path + 'assignment')();
require(models_path + 'classroom')();
require(models_path + 'course')(autoIncrement);
require(models_path + 'user')(autoIncrement);

mongoose.connect(config.mongoURL, function(err){
	if (err){
		console.log('Could not connect to Mongo database.');
	}else{
		console.log('Connected to the Mongo database.');
	}
});

module.exports = mongoose;