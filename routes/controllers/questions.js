var mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.addQuestion = function(req, res){
	var assignment = res.locals.assignment;
	
	assignment.questions.push(new Question());
	assignment.contentOrder.push('question');

	assignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}

		return helper.sendSuccess(res, assignment.questions[assignment.questions.length-1]);
	});
}

module.exports.editQuestion = function(req, res){
	var assignment = res.locals.assignment;

	//Check if undefined
	if (typeof assignment.questions[req.body.questionIndex] === 'undefined'){
		return helper.sendError(res, 400, 3000, 'That question does not exist.');
	}

	var question = assignment.questions[req.body.questionIndex];

	//Parse the answers
	if (req.body.questionType === 'fillblank'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(req.body.fillAnswers)){
			return helper.sendError(res, 401, 3000, 'Something went wrong with the multiple choice selection.');
		}

		if (req.body.fillAnswers.length >= 10){
			return helper.sendError(res, 401, 3000, 'Must have less than 10 possible answers');
		}

		//Delete empty entries and make other ones more palatable
		for (var i = req.body.fillAnswers.length - 1; i >= 0; i--){
			if (req.body.fillAnswers[i].length === 0){
				req.body.fillAnswers.splice(i, 1);
			}else{
				req.body.fillAnswers[i] = req.body.fillAnswers[i].toLowerCase().trim();
			}
		}
	}else if (req.body.questionType === 'mc'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(req.body.answerOptions)){
			return helper.sendError(res, 401, 3000, 'Something went wrong with the multiple choice selection.');
		}
	}

	//Probably a better way to do this.
	question.question = req.body.question;
	question.questionType = req.body.questionType;
	question.bIsHomework = req.body.bIsHomework;
	question.pointsWorth = req.body.pointsWorth;
	question.answerOptions = req.body.answerOptions;
	question.mcAnswer = req.body.mcAnswer;
	question.fillAnswers = req.body.fillAnswers;
	question.triesAllowed = (req.body.triesAllowed === 'unlimited' ? 10000 : req.body.triesAllowed);
	

	assignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		return helper.sendSuccess(res);
	});
}

module.exports.deleteQuestion = function(req, res){
	var assignment = res.locals.assignment;
	const questionIndex = req.body.questionIndex;

	assignment.questions.splice(questionIndex, 1);

	//Splice it out of the content order
	var numOfQuestions = 0;
	for (var i = 0; i < assignment.contentOrder.length; i++){
		if (assignment.contentOrder[i] === 'question'){
			if (numOfQuestions === questionIndex){
				assignment.contentOrder.splice(i, 1);
				break;
			}else{
				numOfQuestions++;
			}
		}
	}

	assignment.markModified('contentOrder');

	assignment.save(function(err){
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}
