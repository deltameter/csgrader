var mongoose = require('mongoose'),
	Exercise = mongoose.model('Exercise'),
	httpClient = require('request'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.addExercise = function(req, res){
	var assignment = res.locals.assignment;
	const language = languageHelper.findByString(req.body.language);

	var newExercise = new Exercise({
		title: req.body.title,
		language: language.definition,
		code: language.defaultCode
	});

	assignment.exercises.push(newExercise);

	assignment.contentOrder.push('exercise');

	assignment.save(function(err){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		return helper.sendSuccess(res, assignment.exercises[assignment.exercises.length-1]);
	});
}

module.exports.editExercise = function(req, res){
	var assignment = res.locals.assignment;
	const exerciseIndex = req.body.exerciseIndex;

	var exercise = assignment.exercises[exerciseIndex];

	exercise.context = req.body.context;
	exercise.code = req.body.code;
	exercise.triesAllowed = req.body.triesAllowed === 'unlimited' ? -1 : req.body.triesAllowed;
	exercise.pointsWorth = req.body.pointsWorth;

	assignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		
		return helper.sendSuccess(res, { bIsFinished: assignment.exercises[req.body.exerciseIndex].bIsFinished });
	});
}

module.exports.deleteExercise = function(req, res){
	var assignment = res.locals.assignment;
	const exerciseIndex = req.body.exerciseIndex;

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
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.testExercise = function(req, res){
	var assignment = res.locals.assignment;

	const i = req.body.exerciseIndex;
	var code = req.body.code;

	code.Main = assignment.exercises[i].code.Main;

	var options = {
		uri: config.gradingMachineURL + '/compile',
		method: 'POST',
		json: {
			language: assignment.exercises[i].language.langID,
			code: code
		}
	};

	httpClient(options, function(err, httpRes, body){
		if (err){
			return helper.sendError(res, 500, 1000, 'Could not connect to the server. Please try again.');
		}

		var bIsCorrect = body.errors.length === 0;

		body.bIsCorrect = bIsCorrect;

		if (bIsCorrect){
			assignment.exercises[i].bIsTested = true;
			assignment.save(function(err, assignment){

				body.bIsFinished = assignment.exercises[i].bIsFinished;
				return helper.sendSuccess(res, body);
			});
		}else{
			return helper.sendSuccess(res, body);
		}
	});
}