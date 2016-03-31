'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Course = mongoose.model('Course'),
	Question = mongoose.model('Question'),
	Exercise = mongoose.model('Exercise'),
	submissions = require(__base + 'routes/controllers/submissions'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	var assignment = res.locals.assignment;

	if (!req.user.bIsTeacher){
		return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
	}else{
		return helper.sendSuccess(res, assignment);
	}
}

module.exports.create = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { assignments: 1 }, function(err, course){

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
				return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
			});
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
	assignment.deadlineType = req.body.deadlineType.toLowerCase();
	assignment.pointLoss = req.body.pointLoss;

	assignment.save(function(err, assignment){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.delete = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { assignments: 1}, function(err, course){
		var assignment = res.locals.assignment;

		var aIndex = course.assignments.indexOf(assignment._id);
		course.assignments.splice(aIndex, 1);

		course.save(function(err){
			if (err) return helper.errorHelper(res, 400, 3000, errorHelper(err));
			return helper.sendSuccess(res);
		});
	});
}