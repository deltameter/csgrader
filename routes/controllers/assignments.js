'use strict';

var mongoose = require('mongoose'),
	Assignment = require(__base + 'routes/services/assignment'),
	Course = require(__base + 'routes/services/course'),
	Submission = require(__base + 'routes/services/submission'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		if (req.user.role !== 'teacher'){
			var studentAssignment = Assignment.safeSendStudent(assignment);

			Submission.get(req.user._id, assignment._id, {}, function(err, submission){
				if (err){
					//Could not find a submission by this name. Make one.
					if (err.name === 'DescError' && err.code === 404){
						Submission.create(req.user._id, assignment, function(err, submission){
							studentAssignment.submission = submission;
							return helper.sendSuccess(res, { assignment: studentAssignment, submission: submission });
						});
					}else{
						return helper.sendError(res, 400, err);
					}
				}else{
					return helper.sendSuccess(res, { assignment: studentAssignment, submission: submission });
				}
			});
		}else{
			return helper.sendSuccess(res, { assignment: assignment });
		}
	})
}

module.exports.create = function(req, res){
	req.checkBody('name', 'Please include the assignment name').notEmpty();
	req.checkBody('description', 'Please include the assignment description').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Course.getCourse(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.create(course, req.body, function(err, newAssignment){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res, newAssignment);
		})
	}) 
}

module.exports.edit = function(req, res){
	req.checkBody('name', 'Please include the assignment name').notEmpty();
	req.checkBody('description', 'Please include the assignment description').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.edit(assignment, req.body, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			return helper.sendSuccess(res, assignment);
		})
	});
}

module.exports.open = function(req, res){
	req.checkBody('dueDate', 'Please include the due date').isDate();
	req.checkBody('deadlineType', 'Please include the deadline type').notEmpty();
	
	if (req.body.deadlineType === 'pointloss'){
		req.checkBody('pointLoss', 'Please include the % point loss').isInt();
	}
	
	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Course.getCourse(req.params.courseCode, { openAssignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.get(req.params.assignmentID, {}, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			Assignment.open(course, assignment, req.body, function(err, assignment){
				if (err){ return helper.sendError(res, 400, err); }

				return helper.sendSuccess(res, assignment)
			})
		});
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