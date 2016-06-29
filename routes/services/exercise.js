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
		language: language.definition
	});

	assignment.exercises.push(newExercise);

	//ContentOrder includes the type it is along with the index on the exercise array
	assignment.contentOrder.push('exercise' + newExercise._id);

	assignment.save(function(err){
		if (err){ return callback(err, null); }
		return callback(null, assignment.exercises[assignment.exercises.length-1]);
	});
}

module.exports.editExercise = function(assignment, exerciseIndex, edit, callback){
	var authErr = verifyExerciseExists(assignment, exerciseIndex);
	if (authErr){ return callback(authErr) };

	var exercise = assignment.exercises[exerciseIndex];

	exercise.title = edit.title;
	exercise.context = edit.context;
	exercise.code = edit.code;
	exercise.tests = edit.tests;
	exercise.triesAllowed = edit.triesAllowed === 'unlimited' ? -1 : edit.triesAllowed;
	exercise.pointsWorth = edit.pointsWorth;

	//If it's not finished, check if it is now finished
	if (!exercise.bIsFinished){
		if (exercise.tests.length > 0 && typeof exercise.context !== 'undefined'
		 && typeof exercise.pointsWorth !== 'undefined' && typeof exercise.triesAllowed !== 'undefined'){

			var bTestsComplete = true;

			for (var i = 0; i < exercise.tests.length; i++){
				if (typeof exercise.tests[i].description === 'undefined' || typeof exercise.tests[i].pointsWorth !== 'number'){
					bTestsComplete = false;
					break;
				}
			}

			exercise.bIsFinished = bTestsComplete;
		}
	}

	assignment.save(function(err, assignment){
		console.log(err);
		if (err){ return callback(err, null) }
		
		return callback(null, { bIsFinished: assignment.exercises[exerciseIndex].bIsFinished });
	});
}

module.exports.deleteExercise = function(assignment, exerciseIndex, exerciseID, callback){
	var authErr = (verifyExerciseExists(assignment, exerciseIndex) || verifyAssignmentClosed(assignment));
	if (authErr){ return callback(authErr) };

	assignment.exercises.splice(exerciseIndex, 1);

	//Splice it out of the content order
	var contentIndex = assignment.contentOrder.indexOf('exercise' + exerciseID);
	assignment.contentOrder.splice(contentIndex, 1);

	assignment.markModified('contentOrder');

	assignment.save(function(err){
		if (err) { return callback(err) };
		return callback(null);
	});
}

module.exports.testExercise = function(assignment, exerciseIndex, code, callback){
	var authErr = verifyExerciseExists(assignment, exerciseIndex);
	if (authErr){ return callback(authErr) };

	assignment.exercises[exerciseIndex].solutionCode = code;

	var options = {
		uri: config.gradingMachineURL + '/compile',
		method: 'POST',
		json: {
			language: assignment.exercises[exerciseIndex].language.langID,
			code: code,
			tests: assignment.exercises[exerciseIndex].tests
		}
	};

	httpClient(options, function(err, httpRes, compilationInfo){
		if (err){
			return callback(new DescError('Could not connect to the server. Please try again.', 500), null);
		}

		var bIsCorrect = compilationInfo.errors.length === 0;

		assignment.exercises[exerciseIndex].bIsTested = bIsCorrect;
		compilationInfo.bIsCorrect = bIsCorrect;

		assignment.save(function(err, assignment){
			return callback(null, compilationInfo);
		});
	});
}