var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Question = mongoose.model('Question'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	helper = require(__base + 'routes/libraries/helper');

module.exports.addQuestion = function(req, res){
	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }
	
		if (assignment.isAssignmentOpen()){ return helper.sendError(res, 400, new DescError('Can\'t add question while the assignment is open')) };

		var question = Question.create();

		assignment.addContent('question', question);

		assignment.save(function(err){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, question);
		});
	});
}

module.exports.editQuestion = function(req, res){
	req.checkBody('questionID', 'Please include the question').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const questionID = req.body.questionID;

	const editInfo = {
		question: req.body.question,
		questionType: req.body.questionType,
		answers: req.body.answers,
		mcAnswer: req.body.mcAnswer,
		triesAllowed: (req.body.triesAllowed === 'unlimited' || req.body.questionType === 'frq') ? -1 : req.body.triesAllowed,
		pointsWorth: req.body.pointsWorth,
		bIsHomework: req.body.bIsHomework
	}

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const questionIndex = assignment.getContentIndex('question', questionID);

		var question = assignment.questions[questionIndex];

		question.edit(editInfo);

		const bIsFinished = question.isFinished()

		assignment.save(function(err){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, { bIsFinished: bIsFinished });
		});
	});
}

module.exports.deleteQuestion = function(req, res){
	req.checkBody('questionID', 'Please include the questionID').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const questionID = req.body.questionID;

	Assignment.get(req.params.assignmentID, { bIsOpen: 1, contentOrder: 1, questions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		const questionIndex = assignment.getContentIndex('question', questionID);

		if (questionIndex === -1 || assignment.isAssignmentOpen()){
			return helper.sendError(res, 400, new DescError('That question does not exist or the assignment is open and cannot be edited.', 404));
		}

		assignment.deleteContent('question', questionIndex, questionID);

		assignment.save(function(err){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res);
		})
	});
}
