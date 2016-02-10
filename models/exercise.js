'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var exerciseSchema = new Schema({
	exerciseContext: String,
	testCases: [String],
	correctAnswers: [String]
});

mongoose.model('Exercise', exerciseSchema);
