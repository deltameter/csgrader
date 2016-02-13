'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Course = mongoose.model('Course'),
	Question = mongoose.model('Question'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	var assignment = res.locals.assignment;

	if (!req.user.bIsTeacher){
		Submission.findOne({ studentID: req.user._id, assignmentID: assignment._id}, function(err, sub){
			if (err){
				return helper.sendError(res, 500, 1000, helper.errorHelper(err));
			}

			//Create a new submission if they don't have one
			if (!sub){
				var newSub = new Submission({
					studentID: req.user._id,
					assignmentID: assignment._id
				});

				newSub.save(function(err, sub){
					if (err){
						return helper.sendError(res, 400, 1001, helper.errorHelper(err));
					}

					return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
				});
			}else{
				return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
			}
		});
	}
}

module.exports.create = function(req, res){
	var course = res.locals.course;
	var newAssignment = new Assignment({
		courseID: course._id,
		name: req.body.name,
		description: req.body.description,
	});

	newAssignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		course.assignments.push(newAssignment._id);
		course.save(function(err, course){
			if (err){
			//Wow, we're fucked
				return helper.sendError(res, 400, 1001, helper.errorHelper(err));
			}
			return helper.sendSuccess(res, assignment);
		});
	});
}

module.exports.edit = function(req, res){
	var assignment = res.locals.assignment;

	assignment.name = req.body.name;
	assignment.description = req.body.description;

	assignment.save(function(err, assignment){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.open = function(req, res){
	var assignment = res.locals.assignment;

	assignment.bIsOpen = true;
	assignment.dueDate = req.body.dueDate;
	assignment.deadlineType = req.body.deadlineType;
	assignment.pointsWorth = req.body.pointsWorth;
	assignment.pointLoss = req.body.pointLoss;

	assignment.save(function(err, assignment){
		if (err) return helper.sendErr(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.addQuestion = function(req, res){
	var assignment = res.locals.assignment;
	var answerOptions;

	//Parse the answers
	if (req.body.questionType == 'fillblank'){
		answerOptions = req.body.answerOptions.split(',');
		if (answerOptions.length >= 10) return helper.sendError(res, 401, 'Must have less than 10 possible answers');

		//Remove spaces to check for string comparisons easier
		for (var i = 0; i < answerOptions.length; i++){
			answerOptions[i] = answerOptions[i].trim();
		}
	}else if (req.body.questionType == 'mc'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(req.body.answerOptions)){
			return helper.sendError(res, 401, 'Something went wrong with the multiple choice selection');
		}
		answerOptions = req.body.answerOptions;
	}

	var newQuestion = new Question({
		question: req.body.question,
		questionType: req.body.questionType,
		bIsHomework: req.body.bIsHomework,
		pointsWorth: req.body.pointsWorth,
		answerOptions: answerOptions,
		mcAnswer: req.body.mcAnswer
	});

	assignment.questions.push(newQuestion);
	assignment.save(function(err, assignment){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}

		return helper.sendSuccess(res);
	});
}

module.exports.addExercise = function(req, res){
	
}