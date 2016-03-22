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
		language: language.langID,
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
	exercise.triesAllowed = req.body.triesAllowed === 'unlimited' ? 100000 : req.body.triesAllowed;

	assignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		return helper.sendSuccess(res);
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

	assignment.save(function(err){1
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.testExercise = function(req, res){
	console.log(req.body);
	var assignment = res.locals.assignment;

	const i = req.body.exerciseIndex;
	const code = req.body.code;

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
		var bIsCorrect = body.errors.length === 0;

		if (bIsCorrect){
			assignment.exercises[i].bIsTested = true;
			assignment.save();
		}

		body.bIsCorrect = bIsCorrect;
		return helper.sendSuccess(res, body);
	});
}