'use strict';

var mongoose = require('mongoose'),
	httpClient = require('request'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var assignment = res.locals.assignment;

	var questionAnswers = new Array(assignment.questions.length),
		questionTries = new Array(assignment.questions.length),
		questionsCorrect = new Array(assignment.questions.length),
		questionPoints = new Array(assignment.questions.length);

	var	exerciseAnswers = new Array(assignment.exercises.length),
		exerciseTries = new Array(assignment.exercises.length),
		exercisesCorrect = new Array(assignment.exercises.length),
		exercisePoints = new Array(assignment.exercises.length);

	for (var i = 0; i < assignment.questions.length; i++){
		questionAnswers[i] = '';
		questionTries[i] = 0;
		questionsCorrect[i] = false;
		questionPoints[i] = 0;
	}

	for (var i = 0; i < assignment.exercises.length; i++){
		exerciseAnswers[i] = '';
		exerciseTries[i] = 0;
		exercisesCorrect[i] = false;
		exercisePoints[i] = 0;
	}

	var newSubmission = new Submission({
		studentID: req.user._id,
		assignmentID: assignment._id,
		questionAnswers: questionAnswers,
		questionTries: questionTries,
		questionsCorrect: questionsCorrect,
		questionPoints: questionPoints,
		exerciseAnswers: exerciseAnswers,
		exerciseTries: exerciseTries,
		exercisesCorrect: exercisesCorrect,
		exercisePoints: exercisePoints
	});

	newSubmission.save(function(err, newSubmission){
		if (err){
			return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		}

		//if the submission is done being created, return the assignment
		return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
	});
}

module.exports.submitQuestionAnswer = function(req, res){
	const assignment = res.locals.assignment;
	const i = req.body.questionIndex;

	Submission.findOne({studentID: req.user._id, assignmentID: req.params.assignmentID }, function(err, submission){
		if (err){
			return helper.sendError(res, 500, 1000, helper.errorHelper(err));
		}

		if (!submission){
			return helper.sendError(res, 400, 3000, 'You don\'t have a submission for this assignment');
		}

		if (submission.questionsCorrect[i]){
			return helper.sendError(res, 400, 3000, 'You\'ve already gotten this answer correct');
		}

		if (submission.questionTries[i] >= assignment.questions[i].triesAllowed){
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
			if (assignment.questions[i].fillAnswers.indexOf(req.body.answer.toString().trim().toLowerCase()) !== -1){
				bIsCorrect = true;
			}
		}

		if (bIsCorrect){
			submission.pointsEarned += assignment.questions[i].pointsWorth;
			submission.questionPoints[i] += assignment.questions[i].pointsWorth;
			submission.questionsCorrect[i] = true;
			submission.markModified('questionPoints');
			submission.markModified('questionsCorrect');
		}

		submission.questionAnswers[i] = req.body.answer.toString();
		submission.questionTries[i]++;
		
		submission.markModified('questionAnswers');
		submission.markModified('questionTries');

		submission.save(function(err, submission){
			if (err){
				return helper.sendError(res, 400, 3000, helper.errorHelper(err));
			}

			return helper.sendSuccess(res, { bIsCorrect: bIsCorrect });
		});
	});
}

module.exports.submitExerciseAnswer = function(req, res){
	const assignment = res.locals.assignment;
	const i = req.body.exerciseIndex;

	Submission.findOne({studentID: req.user._id, assignmentID: req.params.assignmentID }, function(err, submission){
		if (err){
			return helper.sendError(res, 500, 1000, helper.errorHelper(err));
		}

		if (!submission){
			return helper.sendError(res, 400, 3000, 'You don\'t have a submission for this assignment');
		}

		if (submission.exercisesCorrect[i]){
			return helper.sendError(res, 400, 3000, 'You\'ve already gotten this answer correct');
		}

		if (submission.exerciseTries[i] >= assignment.exercises[i].triesAllowed){
			return helper.sendError(res, 400, 3000, 'You can\'t try this exercise any more');
		}

		var code = req.body.code;
		code.Main = assignment.exercises[i].code.Main;

		var options = {
			uri: config.gradingMachineURL + '/compile',
			method: 'POST',
			json: {
				language: assignment.exercises[i].language,
				code: code
			}
		};

		httpClient(options, function(err, httpRes, body){
			//no errors
			if (body.errors.length === 0){
				submission.pointsEarned += assignment.questions[i].pointsWorth;
				submission.exercisePoints[i] += assignment.questions[i].pointsWorth;
				submission.exercisesCorrect[i] = true;
				submission.markModified('exercisePoints');
				submission.markModified('exercisesCorrect');
			}

			submission.exerciseAnswers[i] = code;
			submission.exerciseTries[i]++;

			submission.markModified('exerciseAnswers');
			submission.markModified('exerciseTries');
			
			//Don't wait for the submission to save. Auto grader already takes long enough
			submission.save();

			return helper.sendSuccess(res, body);
		});
	});
}