var mongoose = require('mongoose'),
	Assignment = require(__base + 'routes/services/assignment'),
	Exercise = require(__base + 'routes/services/exercise'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.addExercise = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const language = languageHelper.findByString(req.body.language);

		Exercise.addExercise(assignment, language, req.body.title, function(err, exercise){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, exercise);
		});
	});
}

module.exports.editExercise = function(req, res){
	Assignment.get(req.params.assignmentID, { exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Exercise.editExercise(assignment, req.body.exerciseIndex, req.body, function(err, editInfo){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, editInfo);
		});
	});
}

module.exports.deleteExercise = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Exercise.deleteExercise(assignment, req.body.exerciseIndex, function(err){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res);
		})
	});
}

module.exports.testExercise = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, exercises: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Exercise.testExercise(assignment, req.body.exerciseIndex, req.body.code, function(err, compilationInfo){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, compilationInfo);
		});
	});
}