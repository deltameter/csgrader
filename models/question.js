'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	DescError = require(__base + 'routes/libraries/errors').DescError;

var questionTypes = 'frq fillblank mc'.split(' ');

var questionSchema = new Schema({
	//automatically set in the presave hook
	bIsFinished: { type: Boolean, default: false },
	question: String,
	questionType: { type: String, enum: questionTypes },
	pointsWorth: Number,

	bIsHomework: { type: Boolean, default: false }, //automatically grade as correct

	//For MC or fill in the blank, this is a list of possible answers.
	answers: [String],

	//the answer index
	mcAnswer: Number,

	triesAllowed: Number
});

questionSchema.path('pointsWorth').validate(function(pointsWorth){
	return pointsWorth >= 0;
}, 'The amount of points the question is worth must be >= 0');

questionSchema.statics = {
	/*
		@description: returns a new question
		@return Question: returns a question
	*/

	create: function(){
		var newQuestion = new this();
		//create it with an empty answer for the teacher to fill in
		newQuestion.answers = [''];
		return newQuestion;
	}
}

questionSchema.methods = {
	stripAnswers: function(){
		var question = this;
		return {
			question: question.question, //top kek
			questionType: question.questionType,
			pointsWorth: question.pointsWorth,
			answers: question.answers,
			triesAllowed: question.triesAllowed
		}
	},

	/*
		@description: takes an object literal and set's the exercise's keys equal to it's keys
		@param {Object Literal} editInfo: an object literal containing the changes the user wishes to make
	*/

	edit: function(editInfo){
		var question = this;

		//Parse the answers
		if (editInfo.questionType === 'fillblank' || editInfo.questionType === 'mc'){
			//ensure data integrity. answers must be an array
			if (!Array.isArray(editInfo.answers)){
				return callback(new DescError('Something went wrong with creating answers.', 400), null);
			}

			if (editInfo.answers.length >= 10){
				return callback(new DescError('Must have less than 10 possible answers', 400), null);
			}

			//Delete empty entries and make other ones more palatable
			for (var i = editInfo.answers.length - 1; i >= 0; i--){
				if (editInfo.answers[i].length === 0){
					editInfo.answers.splice(i, 1);
				}else{
					editInfo.answers[i] = editInfo.answers[i].trim();
				}
			}
		}

		for(var key in editInfo){
			question[key] = editInfo[key];
		}
	},

	gradeAnswer: function(answer){
		var question = this;
		var bIsCorrect = false;

		if (question.bIsHomework){
			bIsCorrect = true;
		}else if (question.questionType === 'mc'){
			if (answer === question.mcAnswer){
				bIsCorrect = true;
			}
		}else if (question.questionType === 'fillblank'){
			//if it's in the list of possible answers, it's correct
			for (var ans = 0; ans < question.answers.length; ans++){
				if (question.answers[ans].toLowerCase() === answer.toString().trim().toLowerCase()){
					bIsCorrect = true;
					break;
				}
			}
		}

		return bIsCorrect;
	},

	isFinished: function(){
		var question = this;
		var bIsFinished = false;
		//Mark the question as complete if everything is done.
		//Assignments can only be opened if all questions are completed.
		if (typeof question.question !== 'undefined' && typeof question.questionType !== 'undefined'
		 && typeof question.pointsWorth !== 'undefined' && typeof question.triesAllowed !== 'undefined'){

		 	//FRQ doesn't require anything
		 	if (question.questionType === 'frq'){
		 		bIsFinished = true;

		 		//fill in the blank requires a list of correct answers
		 	}else if (question.questionType === 'fillblank' && typeof question.answers !== undefined){
		 		bIsFinished =  true;

		 		//mc requires a list of options, as well as an answer
		 	}else if (question.questionType === 'mc' && typeof question.answers !== undefined 
	 			&& typeof question.mcAnswer !== 'undefined'){
	 			bIsFinished =  true;
	 		}
		}

		question.bIsFinished = bIsFinished;
		return bIsFinished;
	}
}

mongoose.model('Question', questionSchema);
