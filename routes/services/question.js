'use strict';

var mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

var verifyQuestionExists = function(assignment, exerciseIndex){
	if (exerciseIndex >= assignment.questions.length){
		return new DescError('That exercise does not exist', 404);
	}
}

var verifyAssignmentClosed = function(assignment){
	if (assignment.bIsOpen){
		return new DescError('You cannot do this while the assignment is open.', 400);
	}
}

module.exports.addQuestion = function(assignment, callback){
	var authErr = verifyAssignmentClosed(assignment);
	if (authErr){ return callback(authErr) };

	assignment.questions.push(new Question());
	assignment.contentOrder.push('question');
	assignment.markModified('contentOrder');

	assignment.save(function(err, assignment){
		if (err) { return callback(err, null); }

		return callback(null, assignment.questions[assignment.questions.length-1]);
	});
}

module.exports.editQuestion = function(assignment, questionIndex, edit, callback){
	var authErr = verifyQuestionExists(assignment, questionIndex);
	if (authErr){ return callback(authErr) };

	var question = assignment.questions[questionIndex];

	//Parse the answers
	if (edit.questionType === 'fillblank'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(edit.fillAnswers)){
			return callback(new DescError('Something went wrong with the multiple choice selection.', 400), null);
		}

		if (edit.fillAnswers.length >= 10){
			return callback(new DescError('Must have less than 10 possible answers', 400), null);
		}

		//Delete empty entries and make other ones more palatable
		for (var i = edit.fillAnswers.length - 1; i >= 0; i--){
			if (edit.fillAnswers[i].length === 0){
				edit.fillAnswers.splice(i, 1);
			}else{
				edit.fillAnswers[i] = edit.fillAnswers[i].toLowerCase().trim();
			}
		}
	}else if (edit.questionType === 'mc'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(edit.answerOptions)){
			return callback(new DescError('Something went wrong with the multiple choice selection.', 400), null);
		}
	}

	//Probably a better way to do this.
	question.question = edit.question;
	question.questionType = edit.questionType;
	question.bIsHomework = edit.bIsHomework;
	question.pointsWorth = edit.pointsWorth;
	question.answerOptions = edit.answerOptions;
	question.mcAnswer = edit.mcAnswer;
	question.fillAnswers = edit.fillAnswers;
	question.triesAllowed = (edit.triesAllowed === 'unlimited' ? -1 : edit.triesAllowed);
	
	assignment.save(function(err, assignment){
		if (err){ return callback(err, null) }
		return callback(null, { bIsFinished: assignment.questions[questionIndex].bIsFinished });
	});
}

module.exports.deleteQuestion = function(assignment, questionIndex, callback){
	var authErr = (verifyQuestionExists(assignment, questionIndex) || verifyAssignmentClosed(assignment));
	if (authErr){ return callback(authErr) };

	assignment.questions.splice(questionIndex, 1);

	//Splice it out of the content order
	var numOfQuestions = 0;
	for (var i = 0; i < assignment.contentOrder.length; i++){
		if (assignment.contentOrder[i] === 'question'){
			if (numOfQuestions === questionIndex){
				assignment.contentOrder.splice(i, 1);
				break;
			}else{
				numOfQuestions++;
			}
		}
	}

	assignment.markModified('contentOrder');

	assignment.save(function(err){
		if (err) { return callback(err); }
		return callback(null);
	});

}