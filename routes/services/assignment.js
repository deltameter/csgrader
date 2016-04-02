'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Question = mongoose.model('Question'),
	Exercise = mongoose.model('Exercise'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.get = function(assignmentID, projection, callback){
	Assignment.findOne({ _id: assignmentID }, projection, function(err, assignment){
		if (err || !assignment){ return callback(new DescError('That course was not found', 400), null) };

		return callback(null, assignment);
	});
}

module.exports.create = function(course, assignmentInfo, callback){
	var newAssignment = new Assignment({
		courseID: course._id,
		name: assignmentInfo.name,
		description: assignmentInfo.description
	});

	newAssignment.save(function(err, assignment){
		if (err){ return callback(err, null); }

		course.assignments.push(newAssignment._id);
		course.save(function(err, course){
			return callback(err, newAssignment);
		});
	});
}

module.exports.edit = function(assignment, editInfo, callback){
	assignment.name = editInfo.name;
	assignment.description = editInfo.description;

	assignment.save(function(err, assignment){
		return callback(err, assignment);
	});
}

module.exports.open = function(assignment, openInfo, callback){
	assignment.bIsOpen = true;
	assignment.dueDate = openInfo.dueDate;
	assignment.deadlineType = openInfo.deadlineType.toLowerCase();
	assignment.pointLoss = openInfo.pointLoss;

   	if (assignment.dueDate < Date.now()){
       return callback(new DescError('Due date must be in the future', 400), null)
    }

	var bIsFinished = true;
	var pointsWorth = 0;

	for (var i = 0; i < assignment.questions.length; i++){
		pointsWorth += assignment.questions[i].pointsWorth;
		if (!assignment.questions[i].bIsFinished) { 
			bIsFinished = false;
			break;
		}
	}

	if (!bIsFinished){
		return callback(new DescError('Not all questions are finished.', 400), null)
	}

	for (var i = 0; i < assignment.exercises.length; i++){
		pointsWorth += assignment.exercises[i].pointsWorth;
		if (!assignment.exercises[i].bIsFinished) { 
			bIsFinished = false;
			break;
		}
	}

	if (!bIsFinished){
		return callback(new DescError('Not all exercises are finished.', 400), null)
	}

	assignment.pointsWorth = pointsWorth;

	assignment.save(function(err, assignment){
		return callback(err, assignment);
	});
}

module.exports.delete = function(course, assignment, callback){
	var aIndex = course.assignments.indexOf(assignment._id);
	course.assignments.splice(aIndex, 1);

	course.save(function(err){
		return callback(err);
	});
}

module.exports.safeSendStudent = function(assignment){
	return assignment;
}