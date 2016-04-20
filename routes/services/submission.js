'use strict';

var mongoose = require('mongoose'),
	httpClient = require('request'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	Submission = mongoose.model('Submission'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	config = require(__base + 'app/config');

module.exports.get = function(userID, assignmentID, projection, callback){
	Submission.findOne({ studentID: userID, assignmentID: assignmentID }, projection, function(err, submission){
		if (err) { return callback(err, null); }
		if (!submission) { return callback(new DescError('There is no submission for that user', 404), null); }
		return callback(null, submission);
	})
}

module.exports.create = function(userID, assignment, callback){
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
		exerciseAnswers[i] = assignment.exercises[i].code;

		delete exerciseAnswers[i][languageHelper.testFileName];

		exerciseTries[i] = 0;
		exercisesCorrect[i] = false;
		exercisePoints[i] = 0;
	}

	var newSubmission = new Submission({
		studentID: userID,
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
		if (err) { return (err, null); }

		return callback(null, newSubmission);
	});
}

module.exports.submitQuestionAnswer = function(assignment, submission, questionIndex, answer, callback){
	const i = questionIndex;

	if (typeof assignment.questions[i] === 'undefined'){
		return callback(new DescError('Invalid question.', 400), null);
	}

	if (submission.questionsCorrect[i]){
		return callback(Error('You\'ve already gotten this question correct!'), null);
	}

	//-1 = unlimited tries
	if (assignment.questions[i].triesAllowed !== -1 && 
		submission.questionTries[i] >= assignment.questions[i].triesAllowed){
		return callback(Error('You can\'t try this question any more'), null);
	}

	var bIsCorrect = false;

	if (assignment.questions[i].bIsHomework){
		bIsCorrect = true;
	}else if (assignment.questions[i].questionType === 'mc'){
		if (answer === assignment.questions[i].mcAnswer){
			bIsCorrect = true;
		}
	}else if (assignment.questions[i].questionType === 'fillblank'){
		//if it's in the list of possible answers, it's correct
		if (assignment.questions[i].fillAnswers.indexOf(answer.toString().trim().toLowerCase()) !== -1){
			bIsCorrect = true;
		}
	}

	if (bIsCorrect){
		var points = assignment.questions[i].pointsWorth;

		//remove points if it's late
		if (assignment.deadlineType === 'pointloss' && assignment.dueDate < Date.now()){
			points = points * (assignment.pointLoss / 100);
		}

		submission.pointsEarned += points;
		submission.questionPoints[i] += points;
		submission.questionsCorrect[i] = true;
		submission.markModified('questionPoints');
		submission.markModified('questionsCorrect');
	}

	submission.questionAnswers[i] = answer.toString();
	submission.questionTries[i]++;
	
	submission.markModified('questionAnswers');
	submission.markModified('questionTries');

	submission.save(function(err, submission){
		if (err){ return callback(err, null) };

		return callback(err, bIsCorrect);
	});
}

module.exports.saveExerciseAnswer = function(submission, code, exerciseIndex, callback){
	const i = exerciseIndex;

	submission.exerciseAnswers[i] = code;

	submission.save(function(err, submission){
		if (err){ return callback(err, null) };

		return callback(null);
	});
}

module.exports.submitExerciseAnswer = function(assignment, submission, exerciseIndex, code, callback){
	const i = exerciseIndex;

	if (typeof assignment.exercises[i] === 'undefined'){
		return callback(new DescError('Invalid exercise.', 400), null);
	}

	//-1 = unlimited
	if (assignment.exercises[i].triesAllowed !== -1 && 
		submission.exerciseTries[i] >= assignment.exercises[i].triesAllowed){
		return callback(new DescError('You can\'t try this exercise any more', 400), null);
	}

	code.Main = assignment.exercises[i].code.Main;

	var options = {
		uri: config.gradingMachineURL + '/compile',
		method: 'POST',
		json: {
			language: assignment.exercises[i].language.langID,
			code: code
		}
	};

	httpClient(options, function(err, httpRes, compilationInfo){
		if (err){ callback(err, null) }
		//no errors

		compilationInfo.bIsCorrect = (compilationInfo.errors.length === 0 && !submission.exercisesCorrect[i]);

		if (compilationInfo.bIsCorrect){
			var points = assignment.exercises[i].pointsWorth;

			if (assignment.deadlineType === 'strict'){
				console.log('asdf')
			}
			//remove points if it's late
			if (assignment.deadlineType === 'pointloss' && assignment.dueDate < Date.now()){
				points = points * (assignment.pointLoss / 100);
			}

			submission.pointsEarned += points;
			submission.exercisePoints[i] = points;
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

		return callback(null, compilationInfo);
	});
}