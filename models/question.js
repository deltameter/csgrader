'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var questionTypes = 'frq fillblank mc'.split(' ');

var questionSchema = new Schema({
	//automatically set in the presave hook
	bIsFinished: { type: Boolean, default: false },
	question: String,
	questionType: { type: String, enum: questionTypes },
	pointsWorth: Number,

	bIsHomework: { type: Boolean, default: false }, //automatically grade as correct

	//For MC or Fillblank, this is a list of possible answers.
	answers: [String],

	//the answer index
	mcAnswer: Number,

	triesAllowed: Number
});

questionSchema.path('pointsWorth').validate(function(pointsWorth){
	return pointsWorth >= 0;
}, 'The amount of points the question is worth must be >= 0');

questionSchema.statics = {
	safeSendStudent: function(question){
		return {
			question: question.question, //top kek
			questionType: question.questionType,
			pointsWorth: question.pointsWorth,
			answerOptions: question.answerOptions,
			triesAllowed: question.triesAllowed
		}
	}
}

mongoose.model('Question', questionSchema);
