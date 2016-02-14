'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var questionTypes = 'frq fillblank mc'.split(' ');

var questionSchema = new Schema({
	bIsFinished: { type: Boolean, default: false },
	question: String,
	questionType: { type: String, enum: questionTypes },
	pointsWorth: Number,

	bIsHomework: { type: Boolean, default: false }, //automatically grade as correct

	//For MC, this is a list of possible answers.
	//For fill in the blank, this is a list of acceptable answers
	answerOptions: [String],
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
	 	if (question.questionType === 'frq'){
	 		question.bIsFinished = true;
	 	}else if (typeof question.answerOptions !== undefined){
	 		if (question.questionType === 'fillblank'){
	 			question.bIsFinished = true;
	 		}else if (question.questionType === 'mc' && typeof question.mcAnswer !== 'undefined'){
	 			question.bIsFinished = true;
	 		}
	 	}
	}
	
	return next();
})

mongoose.model('Question', questionSchema);
