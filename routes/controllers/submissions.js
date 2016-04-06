'use strict';

var mongoose = require('mongoose'),
	Assignment = require(__base + 'routes/services/assignment'),
	Submission = require(__base + 'routes/services/submission'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.submitQuestionAnswer = function(req, res){
	req.checkBody('questionIndex', 'Please include the question').isInt();
	req.checkBody('answer', 'Please include the question answer').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
		const questionProjection = { pointsEarned: 1, questionsCorrect: 1, questionTries: 1, questionPoints: 1, questionAnswers: 1 };

		Submission.get(req.user._id, assignment._id, questionProjection, function(err, submission){
			if (err) return helper.sendError(res, 400, err);

			Submission.submitQuestionAnswer(assignment, submission, req.body.questionIndex, req.body.answer, function(err, bIsCorrect){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res, { bIsCorrect: bIsCorrect });
			})
		})
	});
}

module.exports.saveExerciseAnswer = function(req, res){
	req.checkBody('exerciseIndex', 'Please include the exercise').isInt();
	req.checkBody('code', 'Please include the exercise answer').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Submission.get(req.user._id, assignment._id, { exerciseAnswers: 1 }, function(err, submission){
			if (err) return helper.sendError(res, 400, err);

			Submission.saveExerciseAnswer(submission, req.body.exerciseIndex, req.body.code, function(err, bIsCorrect){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res);
			});
		})
	});
}

module.exports.submitExerciseAnswer = function(req, res){
	req.checkBody('exerciseIndex', 'Please include the exercise').isInt();
	req.checkBody('code', 'Please include the exercise answer').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
		const exerciseProjection = { pointsEarned: 1, exercisesCorrect: 1, exerciseTries: 1, exercisePoints: 1, exerciseAnswers: 1 };

		Submission.get(req.user._id, assignment._id, exerciseProjection, function(err, submission){
			if (err) return helper.sendError(res, 400, err);

			Submission.submitExerciseAnswer(assignment, submission, req.body.exerciseIndex, req.body.code, function(err, compilationInfo){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res, compilationInfo);
			});
		});
	});
}