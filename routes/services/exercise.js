'use strict';

var mongoose = require('mongoose'),
	Exercise = mongoose.model('Exercise'),
	httpClient = require('request'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

var verifyExerciseExists = function(assignment, exerciseIndex){
	if (exerciseIndex >= assignment.exercises.length){
		return new DescError('That exercise does not exist', 404);
	}
}

var verifyAssignmentClosed = function(assignment){
	if (assignment.bIsOpen){
		return new DescError('You cannot do this while the assignment is open.', 400);
	}
}

module.exports.addExercise = function(assignment, language, title, callback){
	var authErr = verifyAssignmentClosed(assignment);
	if (authErr){ return callback(authErr) };

	var newExercise = new Exercise({
		title: title,
		language: language.definition,
		code: language.defaultCode
	});

	assignment.exercises.push(newExercise);

	assignment.contentOrder.push('exercise');

	assignment.save(function(err){
		if (err){ return callback(err, null); }
		return callback(null, assignment.exercises[assignment.exercises.length-1]);
	});
}

module.exports.editExercise = function(assignment, exerciseIndex, edit, callback){
	var authErr = verifyExerciseExists(assignment, exerciseIndex);
	if (authErr){ return callback(authErr) };

	const i = exerciseIndex;
	var exercise = assignment.exercises[i];

	exercise.context = edit.context;
	exercise.code = edit.code;
	exercise.triesAllowed = edit.triesAllowed === 'unlimited' ? -1 : edit.triesAllowed;
	exercise.pointsWorth = edit.pointsWorth;

	assignment.save(function(err, assignment){
		if (err){ return callback(err, null) }
		
		return callback(null, { bIsFinished: assignment.exercises[i].bIsFinished });
	});
}

module.exports.deleteExercise = function(assignment, exerciseIndex, callback){
	var authErr = (verifyExerciseExists(assignment, exerciseIndex) || verifyAssignmentClosed(assignment));
	if (authErr){ return callback(authErr) };

	assignment.exercises.splice(exerciseIndex, 1);

	//Splice it out of the content order
	var numOfExercises = 0;
	for (var i = 0; i < assignment.contentOrder.length; i++){

		if (assignment.contentOrder[i] === 'exercise'){
			if (numOfExercises === exerciseIndex){
				assignment.contentOrder.splice(i, 1);
				break;
			}else{
				numOfExercises++;
			}
		}
	}

	assignment.markModified('contentOrder');

	assignment.save(function(err){
		if (err) { return callback(err) };
		return callback(null);
	});
}

module.exports.testExercise = function(assignment, exerciseIndex, code, callback){
	var authErr = verifyExerciseExists(assignment, exerciseIndex);
	if (authErr){ return callback(authErr) };

	const i = exerciseIndex;

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
		if (err){
			return callback(new DescError('Could not connect to the server. Please try again.', 500), null);
		}

		var bIsCorrect = compilationInfo.errors.length === 0;

		compilationInfo.bIsCorrect = bIsCorrect;

		if (bIsCorrect){
			assignment.exercises[i].bIsTested = true;
		}

		assignment.save(function(err, assignment){
			compilationInfo.bIsFinished = assignment.exercises[i].bIsFinished;
			return callback(null, compilationInfo);
		});
	});
}