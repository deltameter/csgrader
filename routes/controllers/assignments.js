'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Submission = mongoose.model('Submission'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		if (req.user.role !== 'teacher'){
			var studentAssignment = assignment.stripAnswers(assignment);

			Submission.get(req.user._id, assignment._id, {}, function(err, submission){
				if (err){
					//Could not find a submission by this name. Make one.
					if (err instanceof DescError){
						Submission.create(req.user._id, assignment, function(err, submission){
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

module.exports.find = function(req, res){
	//Want full list, no search terms
	Course.get(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err) return helper.sendError(res, 400, err);

		var searchTerms = req.query.searchTerms;

		const searchProjection = { 
			name: 1, 
			questionNum: { $size: '$questions'}, 
			exerciseNum: { $size: '$exercises' }, 
			bIsFinished: 1,
			pointsWorth: 1
		}

		if (typeof searchTerms === 'undefined'){
			Assignment.getList(course.assignments, searchProjection, function(err, assignments){
				if (err) return helper.sendError(res, 400, err);

				return helper.sendSuccess(res, { assignments: assignments });
			});
		}else{
			Assignment.search(course.assignments, searchTerms, 5, searchProjection, function(err, assignments){
				if (err) return helper.sendError(res, 400, err);
				return helper.sendSuccess(res, { assignments: assignments });
			});
		}
	})
}

module.exports.create = function(req, res){
	req.checkBody('name', 'Please include the assignment name').notEmpty();
	req.checkBody('description', 'Please include the assignment description').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const name = req.body.name;
	const description = req.body.description;

	Course.get(req.params.courseCode, { courseCode: 1, assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }

		var newAssignment = Assignment.create(course, name, description);
		
		newAssignment.save();

		course.addAssignment(newAssignment);

		course.save(function(err){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res, { assignmentID: newAssignment._id });
		})
	}) 
}

module.exports.edit = function(req, res){
	req.checkBody('name', 'Please include the assignment name').notEmpty();
	req.checkBody('description', 'Please include the assignment description').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const name = req.body.name;
	const description = req.body.description;

	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		assignment.edit(name, description);

		assignment.save(function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }
			return helper.sendSuccess(res, assignment);
		})
	});
}

module.exports.open = function(req, res){
	req.checkBody('dueDate', 'Please include the due date').isDate();
	req.checkBody('deadlineType', 'Please include the deadline type').notEmpty();
	
	if (req.body.deadlineType === 'pointloss'){
		req.checkBody('pointLoss', 'Point loss should be an integer from 0-100').isInt({min: 0, max: 100});
	}
	
	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const dueDate = req.body.dueDate;
	const deadlineType = req.body.deadlineType;
	const pointLoss = req.body.pointLoss;

	Course.get(req.params.courseCode, { openAssignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }

		Assignment.get(req.params.assignmentID, {}, function(err, assignment){
			if (err){ return helper.sendError(res, 400, err); }

			assignment.open(dueDate, deadlineType, pointLoss, function(err, assignment){
				if (err){ return helper.sendError(res, 400, err); }

				course.addOpenAssignment(assignment);
				course.save();
				
				return helper.sendSuccess(res, assignment);
			})
		});
	});
}

module.exports.delete = function(req, res){
	req.checkParams('assignmentID', 'Please include the assignmentID').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const assignmentID = req.params.assignmentID;

	Course.get(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }
		
		course.deleteAssignment(assignmentID);

		course.save(function(err, newAssignment){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res);
		});
	});
}