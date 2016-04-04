var mongoose = require('mongoose'),
	Assignment = require(__base + 'routes/services/assignment'),
	Question = require(__base + 'routes/services/question'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.addQuestion = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
	
		Question.addQuestion(assignment, function(err, question){
			if (err) {return helper.sendError(res, 400, err); }
			return  helper.sendSuccess(res, question);
		});
	});
}

module.exports.editQuestion = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Question.editQuestion(assignment, req.body.questionIndex, req.body, function(err, question){
			if (err) {return helper.sendError(res, 400, err); }
			return  helper.sendSuccess(res, question);
		})
	});
}

module.exports.deleteQuestion = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Question.deleteQuestion(assignment, req.body.questionIndex, req.body.questionID, function(err){
			if (err) { return helper.sendError(res, 400, err); }
			return  helper.sendSuccess(res);
		});
	});
}
