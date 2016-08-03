
var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Exercise = mongoose.model('Exercise'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	helper = require(__base + 'routes/libraries/helper');

module.exports.addExercise = function(req, res){
	req.checkBody('title', 'Please include the exercise title').notEmpty();
	req.checkBody('language', 'Please include the exercise language').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const title = req.body.title;
	const language = languageHelper.findByLangName(req.body.language);

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		if (assignment.isAssignmentOpen()){ return helper.sendError(res, 400, new DescError('Can\'t add exercise while the assignment is open')) };
		
		var exercise = Exercise.create(language, title);

		assignment.addContent('exercise', exercise);

		assignment.save(function(err){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, exercise);
		});
	});
}

module.exports.editExercise = function(req, res){
	req.checkBody('exerciseID', 'Please include the exercise').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseID = req.body.exerciseID;

	const editInfo = {
		title: req.body.title,
		context: req.body.context,
		code: req.body.code,
		tests: req.body.tests,
		triesAllowed: req.body.triesAllowed === 'unlimited' ? -1 : req.body.triesAllowed
	}

	Assignment.get(req.params.assignmentID, { exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const exerciseIndex = assignment.getContentIndex('exercise', exerciseID);

		var exercise = assignment.exercises[exerciseIndex];

		exercise.edit(editInfo);

		const bIsFinished = exercise.isFinished()

		assignment.save(function(err){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, { bIsFinished: bIsFinished });
		});
	});
}

module.exports.deleteExercise = function(req, res){
	req.checkBody('exerciseID', 'Please include the exerciseID').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseID = req.body.exerciseID;

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const exerciseIndex = assignment.getContentIndex('exercise', exerciseID);
		
		if (exerciseIndex === -1 || assignment.isAssignmentOpen()){
			return helper.sendError(res, 400, new DescError('That exercise does not exist or the assignment is open and cannot be edited.', 404));
		}

		assignment.deleteContent('exercise', exerciseIndex, exerciseID);

		assignment.save(function(err){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res);
		})
	});
}

module.exports.testExercise = function(req, res){
	req.checkBody('exerciseID', 'Please include the exerciseID').isMongoId();
	req.checkBody('code', 'Please include the code').isArray();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const exerciseID = req.body.exerciseID;
	const code = req.body.code;

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const exerciseIndex = assignment.getContentIndex('exercise', exerciseID);

		if (exerciseIndex === -1){
		 	return helper.sendError(res, 400, new DescError('That exercise does not exist', 404));
		}

		assignment.exercises[exerciseIndex].runTests(code, function(err, results){
			if (err){ return helper.sendError(res, 400, err); }

			assignment.exercises[exerciseIndex].saveTeacherSolution(results.bIsCorrect, code);
			assignment.save();
			
			return helper.sendSuccess(res, results);
		})
	});
}