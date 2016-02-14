'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var assignment = res.locals.assignment;

	var questionAnswers = new Array(assignment.questions.length),
		questionTries = new Array(assignment.questions.length),
		questionsCorrect = new Array(assignment.questions.length);

	var	exerciseAnswers = new Array(assignment.exercises.length),
		exerciseTries = new Array(assignment.exercises.length),
		exercisesCorrect = new Array(assignment.exercises.length);

	for (var i = 0; i < assignment.questions.length; i++){
		questionAnswers = '';
		questionTries[i] = 0;
		questionsCorrect[i] = false;
	}

	for (var i = 0; i < assignment.exercises.length; i++){
		exerciseAnswers = '';
		exerciseTries[i] = 0;
		exercisesCorrect[i] = false;
	}

	var newSub = new Submission({
		studentID: req.user._id,
		assignmentID: assignment._id,
		questionAnswers: questionAnswers,
		questionTries: questionTries,
		questionsCorrect: questionsCorrect,
		exerciseAnswers: exerciseAnswers,
		exerciseTries: exerciseTries,
		exercisesCorrect: exercisesCorrect
	});

	newSub.save(function(err, sub){
		if (err){
			return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		}

		//if the submission is done being created, return the assignment
		return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
	});
}

module.exports.submitQuestionAnswer = function(req, res){
	var assignment = res.locals.assignment;
	var i = req.body.questionNum;

	Submission.findOne({studentID: req.user._id, assignmentID: req.params.assignmentID }, function(err, sub){
		if (err){
			return helper.sendError(res, 500, 1000, helper.errorHelper(err));
		}

		if (!sub){
			return helper.sendError(res, 400, 3000, 'You don\'t have a submission for this assignment');
		}

		if (sub.questionsCorrect[i]){
			return helper.sendError(res, 400, 3000, 'You\'ve already gotten this answer correct');
		}

		if (sub.questionTries[i] >= assignment.questions[i].triesAllowed){
			return helper.sendError(res, 400, 3000, 'You can\'t try this question any more');
		}

		var bIsCorrect = false;

		if (assignment.questions[i].bIsHomework){
			bIsCorrect = true;
		}else if (assignment.questions[i].questionType === 'mc'){
			if (req.body.answer === assignment.questions[i].mcAnswer){
				bIsCorrect = true;
			}
		}else if (assignment.questions[i].questionType === 'fillblank'){
			//if it's in the list of possible answers, it's correct
			if (assignment.questions[i].answerOptions.indexOf(req.body.answer.toString().trim().toLowerCase()) !== -1){
				bIsCorrect = true;
			}
		}

		if (bIsCorrect){
			sub.pointsEarned += assignment.questions[i].pointsWorth;
			sub.questionsCorrect[i] = true;
			sub.markModified('questionsCorrect');
		}

		sub.questionAnswers[i] = req.body.answer.toString();
		sub.questionTries[i]++;
		
		sub.markModified('questionAnswers');
		sub.markModified('questionTries');

		sub.save(function(err, sub){
			if (err){
				return helper.sendError(res, 400, 3000, helper.errorHelper(err));
			}

			return helper.sendSuccess(res, { bIsCorrect: bIsCorrect });
		})
	});
}