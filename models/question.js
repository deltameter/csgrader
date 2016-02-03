'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var questionSchema = new Schema({
		question: String,
		bIsHomework: Boolean, //automatically grade as correct
	});

	mongoose.model('Question', questionSchema);
}