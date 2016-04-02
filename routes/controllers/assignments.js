'use strict';

var mongoose = require('mongoose'),
	Assignment = require(__base + 'routes/services/assignment'),
	Course = require(__base + 'routes/services/course'),
	Submission = require(__base + 'routes/services/submission'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		if (!req.user.bIsTeacher){
			return helper.sendSuccess(res, Assignment.safeSendStudent(assignment));
		}else{
			return helper.sendSuccess(res, assignment);
		}
	})
}

module.exports.create = function(req, res){
	Course.getCourse(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.create(course, req.body, function(err, newAssignment){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res, newAssignment);
		})
	}) 
}

module.exports.edit = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.edit(assignment, req.body, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			return helper.sendSuccess(res, assignment);
		})
	});
}

module.exports.open = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.open(assignment, req.body, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			return helper.sendSuccess(res, assignment)
		})
	});
}

module.exports.delete = function(req, res){
	Course.getCourse(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }
		Assignment.get(req.params.assignmentID, { _id: 1 }, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			Assignment.delete(course, assignment, function(err, newAssignment){
				if (err) return helper.sendError(res, 400, err);
				return helper.sendSuccess(res, newAssignment);
			});
		});
	});
}