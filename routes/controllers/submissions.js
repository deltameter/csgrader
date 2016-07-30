'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.submitQuestionAnswer = function(req, res){
	req.checkBody('questionID', 'Please include the question').isMongoId();
	req.checkBody('answer', 'Please include the question answer').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const questionID = req.body.questionID;
	const answer = req.body.answer;

	const assignmentProjection = { bIsOpen: 1, questions: 1, dueDate: 1, deadlineType: 1, pointsLoss: 1 };
	const questionProjection = { pointsEarned: 1, questionsCorrect: 1, questionTries: 1, questionPoints: 1, questionAnswers: 1 };

	var questionIndex;

	async.parallel({
		assignment: function(callback){
			Assignment.get(req.params.assignmentID, assignmentProjection, function(err, assignment){
				if (err){ return callback(err) }

				questionIndex = assignment.getContentIndex('question', questionID);

				if (questionIndex === -1){
					return callback(new DescError('You cannot submit anymore.', 404));
				}

				return callback(null, assignment);
			});
		},
		submission: function(callback){
			Submission.get(assignment._id, req.user._id, questionProjection, function(err, submission){
				return callback(err, submission);
			});
		}
	}, function(err, results){
		if (err){ return helper.sendError(res, 400, err); }

		var submission = results.submission;
		var assignment = results.assignment;

		const question = assignment.questions[questionIndex];

		//check if the user has tried too many times already
		err = submission.isQuestionLocked(question, questionIndex);
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
}

module.exports.submitExerciseAnswer = function(req, res){
	req.checkBody('exerciseID', 'Please include the exercise').isMongoId();
	req.checkBody('code', 'Please include the code').isArray();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	if (req.user.isRateLimited()){
		return helper.sendError(res, 400, new DescError('Please wait before submitting more exercises', 400))
	}

	const exerciseID = req.body.exerciseID;
	const code = req.body.code;
	
	const exerciseProjection = { pointsEarned: 1, exercisesCorrect: 1, exerciseTries: 1, exercisePoints: 1, exerciseAnswers: 1 };
	const assignmentProjection = { bIsOpen: 1, exercises: 1, dueDate: 1, deadlineType: 1, pointsLoss: 1 };

	var exerciseIndex;

	async.parallel({
		assignment: function(callback){
			Assignment.get(req.params.assignmentID, assignmentProjection, function(err, assignment){
				if (err){ return callback(err) }

				exerciseIndex = assignment.getContentIndex('exercise', exerciseID);
				
				if (exerciseIndex === -1){
					return callback(new DescError('That exercise does not exist', 404));
				}

				return callback(null, assignment);
			});
		},
		submission: function(callback){
			Submission.get(assignment._id, req.user._id, exerciseProjection, function(err, submission){
				return callback(err, submission);
			});
		}
	}, function(err, results){
		var assignment = results.assignment;
		var submission = results.submission;

		if (err) { return helper.sendError(res, 400, err); }

		const exercise = assignment.exercises[exerciseIndex];

		//check if the user has tried too many times already or if assignment is locked
		err = submission.isExerciseLocked(exercise, exerciseIndex)
		if (err) { return helper.sendError(res, 400, err); }

		exercise.runTests(code, function(err, results){
			if (err) { return helper.sendError(res, 400, err); }

			submission.rewardExerciseAnswer(assignment, exerciseIndex, results.bIsCorrect, results.pointsEarned);

			submission.recordExerciseAnswer(true, code, exerciseIndex);

			//don't want to expose the errors. might lead to students hardcoding their solutions
			results.errors = '';

			submission.save(function(err){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res, results);
			});
		});
	})
}

module.exports.saveExerciseAnswer = function(req, res){
	req.checkBody('exerciseIndex', 'Please include the exercise').isInt();
	req.checkBody('code', 'Please include the exercise answer').isArray();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseIndex = req.body.exerciseIndex;
	const code = req.body.code;

	Submission.get(assignment._id, req.user._id, { exerciseAnswers: 1 }, function(err, submission){
		if (err) return helper.sendError(res, 400, err);

		submission.recordExerciseAnswer(false, code, exerciseIndex);

		submission.save(function(err){
			if (err) return helper.sendError(res, 400, err);

			return helper.sendSuccess(res);
		});
	})
}

module.exports.saveComment = function(req, res){
	req.checkBody('contentType', 'Please include the contentType').isIn(['question', 'exercise']);
	req.checkBody('contentID', 'Please include the contentID').isMongoId();
	req.checkBody('text', 'Please include the comment text').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const contentType = req.body.contentType;
	const contentID = req.body.contentID;
	const text = req.body.text;

	Submission.getByID(req.params.submissionID, { teacherComments: 1 }, function(err, submission){
		if (err) return helper.sendError(res, 400, err);

		submission.recordComment(contentType, contentID, text);

		submission.save(function(err){
			if (err) return helper.sendError(res, 400, err);

			return helper.sendSuccess(res);
		});
	})
}

module.exports.gradeContent = function(req, res){
	req.checkBody('contentType', 'Please include the contentType').isIn(['question', 'exercise']);;
	req.checkBody('contentIndex', 'Please include the contentIndex').isInt();
	req.checkBody('points', 'New points must be a number').isInt();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const contentType = req.body.contentType;
	const contentIndex = req.body.contentIndex;
	const points = parseInt(req.body.points);

	Submission.getByID(req.params.submissionID, { pointsEarned:1, exercisePoints: 1, questionPoints: 1 }, function(err, submission){
		if (err) return helper.sendError(res, 400, err);

		submission.recordGrade(contentType, contentIndex, points);

		submission.save(function(err){
			if (err) return helper.sendError(res, 400, err);

			return helper.sendSuccess(res);
		});
	})
}