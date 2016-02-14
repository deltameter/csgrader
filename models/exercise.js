'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var exerciseSchema = new Schema({
	exerciseContext: String,
	code: [String],
	testCases: [String],
	correctAnswer: String
});

mongoose.model('Exercise', exerciseSchema);
