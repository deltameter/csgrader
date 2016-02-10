'use strict';

var mongoose = require('mongoose'),
	fs = require('fs'),
	config = require('./config'),
	models_path = __base + 'models/';

require(models_path + 'question');
require(models_path + 'exercise');
require(models_path + 'submission');
require(models_path + 'assignment');
require(models_path + 'classroom');
require(models_path + 'course');
require(models_path + 'user');

mongoose.connect(config.mongoURL, function(err){
	if (err){
		console.log('Could not connect to Mongo database.');
	}else{
		console.log('Connected to the Mongo database.');
	}
});

module.exports = mongoose;