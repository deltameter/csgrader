'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var questionTypes = 'open mc'.split(' ');

	var questionSchema = new Schema({
		maxTries: { type: Number, required: true },
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

	questionSchema.path('maxTries').validate(function(maxTries){
		return maxTries >= 1 && maxTries <= 10;
	}, 'The maximum amount of tries must be between 1 and 10. ');

	questionSchema.statics = {
		properties: {
			maxAnswers: 10
		}
	}

	mongoose.model('Question', questionSchema);
}