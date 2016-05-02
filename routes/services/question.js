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

	var newQuestion = new Question();
	assignment.questions.push(newQuestion);

	//ContentOrder includes the type it is along with it's ID
	assignment.contentOrder.push('question' + newQuestion._id);

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
	if (edit.questionType === 'fillblank' || edit.questionType === 'mc'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(edit.answers)){
			return callback(new DescError('Something went wrong with creating answers.', 400), null);
		}

		if (edit.answers.length >= 10){
			return callback(new DescError('Must have less than 10 possible answers', 400), null);
		}

		//Delete empty entries and make other ones more palatable
		for (var i = edit.answers.length - 1; i >= 0; i--){
			if (edit.answers[i].length === 0){
				edit.answers.splice(i, 1);
			}else{
				edit.answers[i] = edit.answers[i].trim();
			}
		}
	}

	//Probably a better way to do this.
	question.question = edit.question;
	question.questionType = edit.questionType;
	question.bIsHomework = edit.bIsHomework;
	question.pointsWorth = edit.pointsWorth;
	question.answers = edit.answers;
	question.mcAnswer = edit.mcAnswer;
	question.triesAllowed = (edit.triesAllowed === 'unlimited' ? -1 : edit.triesAllowed);
	
	assignment.save(function(err, assignment){
		if (err){ return callback(err, null) }
		return callback(null, { bIsFinished: assignment.questions[questionIndex].bIsFinished });
	});
}

module.exports.deleteQuestion = function(assignment, questionIndex, questionID, callback){
	var authErr = (verifyQuestionExists(assignment, questionIndex) || verifyAssignmentClosed(assignment));
	if (authErr){ return callback(authErr) };

	assignment.questions.splice(questionIndex, 1);

	//Splice it out of the content order
	var contentIndex = assignment.contentOrder.indexOf('question' + questionID);
	assignment.contentOrder.splice(contentIndex, 1);

	assignment.markModified('contentOrder');

	assignment.save(function(err){
		if (err) { return callback(err); }
		return callback(null);
	});

}