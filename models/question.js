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
		answers: [String],

		//if the teacher wants to give points to user as long as they use at LEAST one of the answer words
		//vs. reward 1 point for each word used
		bCheckForOneAnswer: Boolean
	});

	mongoose.model('Question', questionSchema);
}