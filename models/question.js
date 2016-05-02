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

questionSchema.pre('save', function(next){
	var question = this;

	//Mark the question as complete if everything is done.
	//Assignments can only be opened if all questions are completed.
	if (typeof question.question !== 'undefined' && typeof question.questionType !== 'undefined'
	 && typeof question.pointsWorth !== 'undefined' && typeof question.triesAllowed !== 'undefined'){

	 	//FRQ doesn't require anything
	 	if (question.questionType === 'frq'){
	 		question.bIsFinished = true;

	 		//fill in the blank requires a list of correct answers
	 	}else if (question.questionType === 'fillblank' && typeof question.answers !== undefined){
	 		question.bIsFinished = true;

	 		//mc requires a list of options, as well as an answer
	 	}else if (question.questionType === 'mc' && typeof question.answers !== undefined 
 			&& typeof question.mcAnswer !== 'undefined'){
 			question.bIsFinished = true;
 		}
	}
	
	return next();
})

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
