'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Course = mongoose.model('Course'),
	Question = mongoose.model('Question'),
	Exercise = mongoose.model('Exercise'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	var assignment = res.locals.assignment;

	if (!req.user.bIsTeacher){
		Submission.findOne({ studentID: req.user._id, assignmentID: assignment._id}, function(err, submission){
			if (err){
				return helper.sendError(res, 500, 1000, helper.errorHelper(err));
			}

			if (!submission){
				//redirect them to create a new assignment if they don't have one
				return res.redirect('/api/course/'+ req.params.courseCode 
					+'/assignment/' + req.params.assignmentID + '/submission/create');

			}
			return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
		});
	}
}

module.exports.create = function(req, res){
	var course = res.locals.course;

	var newAssignment = new Assignment({
		courseID: course._id,
		name: req.body.name,
		description: req.body.description
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
	assignment.pointsWorth = req.body.pointsWorth,
	assignment.pointLoss = req.body.pointLoss;

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

	assignment.save(function(err, assignment){
		if (err) return helper.sendErr(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.delete = function(req, res){
	var course = res.locals.course;
	var assignment = res.locals.assignment;

	var aIndex = course.assignments.indexOf(assignment._id);
	course.assignments.splice(aIndex, 1);

	course.save(function(err){
		if (err) return helper.errorHelper(res, 400, 3000, errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.addQuestion = function(req, res){
	var assignment = res.locals.assignment;
	
	assignment.questions.push(new Question());
	assignment.contentOrder.push(false);
	assignment.save(function(err){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		return helper.sendSuccess(res);
	});
}

module.exports.editQuestion = function(req, res){
	var assignment = res.locals.assignment;

	//Check if undefined
	if (typeof assignment.questions[req.body.questionNum] === 'undefined'){
		return helper.sendError(res, 400, 3000, 'That question does not exist.');
	}

	var question = assignment.questions[req.body.questionNum];
	var answerOptions;

	//Parse the answers
	if (req.body.questionType === 'fillblank'){
		answerOptions = req.body.answerOptions.split(',');
		if (answerOptions.length >= 10) return helper.sendError(res, 401, 3000, 'Must have less than 10 possible answers');

		//Remove spaces to check for string comparisons easier
		for (var i = 0; i < answerOptions.length; i++){
			answerOptions[i] = answerOptions[i].toLowerCase().trim();
		}
	}else if (req.body.questionType === 'mc'){
		//ensure data integrity. answers must be an array
		if (!Array.isArray(req.body.answerOptions)){
			return helper.sendError(res, 401, 3000, 'Something went wrong with the multiple choice selection');
		}
		answerOptions = req.body.answerOptions;
	}

	//Probably a better way to do this.
	question.question = req.body.question;
	question.questionType = req.body.questionType;
	question.bIsHomework = req.body.bIsHomework;
	question.pointsWorth = req.body.pointsWorth;
	question.answerOptions = answerOptions;
	question.mcAnswer = req.body.mcAnswer;
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
	for (var i = 0; i < assignment.contentOrder; i++){
		if (!assignment.contentOrder[i]){
			if (numOfQuestions === questionIndex){
				assignment.contentOrder.splice(i, 1);
				break;
			}else{
				numOfQuestions++;
			}
		}
	}

	assignment.save(function(err){
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.addExercise = function(req, res){
	var assignment = res.locals.assignment;

	assignment.exercises.push(new Exercise());
	assignment.contentOrder.push(true);
	assignment.save(function(err){
		if (err){
			return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}
		return helper.sendSuccess(res);
	});

	return helper.sendSuccess(res);
}

module.exports.deleteExercise = function(req, res){
	var assignment = res.locals.assignment;
	const exerciseIndex = req.body.exerciseIndex;

	assignment.exercises.splice(exerciseIndex, 1);

	//Splice it out of the content order
	var numOfExercises = 0;
	for (var i = 0; i < assignment.contentOrder; i++){
		if (assignment.contentOrder[i]){
			if (numOfExercises === exerciseIndex){
				assignment.contentOrder.splice(i, 1);
				break;
			}else{
				numOfExercises++;
			}
		}
	}

	assignment.save(function(err){
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}
