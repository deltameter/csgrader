'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var questionTypes = 'open mc'.split(' ');

	var questionSchema = new Schema({
		question: { type: String, required: true },
		questionType: { type: String, enum: questionTypes, required: true },
		bIsHomework: { type: Boolean, required: true }, //automatically grade as correct
		pointsWorth: { type: Number, required: true },

		//If these words are included in the answers, points are awarded.
		answers: [String]
	});

	mongoose.model('Question', questionSchema);
}