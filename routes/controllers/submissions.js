'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.submitQuestionAnswer = function(req, res){
	req.checkBody('questionIndex', 'Please include the question').isInt();
	req.checkBody('answer', 'Please include the question answer').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const questionIndex = req.body.questionIndex;
	const answer = req.body.answer;

	const assignmentProjection = { bIsOpen: 1, questions: 1, dueDate: 1, deadlineType: 1, pointsLoss: 1 };

	Assignment.get(req.params.assignmentID, assignmentProjection, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
		const questionProjection = { pointsEarned: 1, questionsCorrect: 1, questionTries: 1, questionPoints: 1, questionAnswers: 1 };

		Submission.get(req.user._id, assignment._id, questionProjection, function(err, submission){
			if (err) { return helper.sendError(res, 400, err); }

			const question = assignment.questions[questionIndex];

			err = submission.isQuestionLocked(question, questionIndex) || assignment.isLocked();
			if (err) { return helper.sendError(res, 400, err); }

			const bIsCorrect = question.gradeAnswer(answer);

			if (bIsCorrect){
				submission.rewardCorrectQuestion(assignment, questionIndex);
			}

			submission.recordQuestionAnswer(answer, questionIndex);

			submission.save(function(err){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res, { bIsCorrect: bIsCorrect });
			});
		})
	});
}

module.exports.submitExerciseAnswer = function(req, res){
	req.checkBody('exerciseIndex', 'Please include the exercise').isInt();
	req.checkBody('code', 'Please include the code').isArray();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseIndex = req.body.exerciseIndex;
	const code = req.body.code;

	const assignmentProjection = { bIsOpen: 1, exercises: 1, dueDate: 1, deadlineType: 1, pointsLoss: 1 };

	Assignment.get(req.params.assignmentID, assignmentProjection, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
		const exerciseProjection = { pointsEarned: 1, exercisesCorrect: 1, exerciseTries: 1, exercisePoints: 1, exerciseAnswers: 1 };

		Submission.get(req.user._id, assignment._id, exerciseProjection, function(err, submission){
			if (err) { return helper.sendError(res, 400, err); }

			const exercise = assignment.exercises[exerciseIndex];

			err = submission.isExerciseLocked(exercise, exerciseIndex) || assignment.isLocked();
			if (err) { return helper.sendError(res, 400, err); }

			exercise.runTests(code, function(err, results){
				if (err) { return helper.sendError(res, 400, err); }

				if (results.bIsCorrect){
					submission.rewardCorrectExercise(assignment, exerciseIndex);
				}

				submission.recordExerciseAnswer(true, code, exerciseIndex);

				submission.save(function(err){
					if (err) return helper.sendError(res, 400, err);

					return helper.sendSuccess(res, results);
				});
			});
		});
	});
}

module.exports.saveExerciseAnswer = function(req, res){
	req.checkBody('exerciseIndex', 'Please include the exercise').isInt();
	req.checkBody('code', 'Please include the exercise answer').isArray();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseIndex = req.body.exerciseIndex;
	const code = req.body.code;

	Submission.get(req.user._id, assignment._id, { exerciseAnswers: 1 }, function(err, submission){
		if (err) return helper.sendError(res, 400, err);

		submission.recordExerciseAnswer(false, code, exerciseIndex);

		submission.save(function(err){
			if (err) return helper.sendError(res, 400, err);

			return helper.sendSuccess(res);
		});
	})
}
