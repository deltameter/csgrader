'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Submission = mongoose.model('Submission'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	async = require('async'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getAssignment = function(req, res){
	Assignment.get(req.params.assignmentID, {}, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		if (req.user.role === 'teacher'){
			return helper.sendSuccess(res, { assignment: assignment });
		}
		
		const studentAssignment = assignment.stripAnswers();

		Submission.get(assignment._id, req.user._id, {}, function(err, submission){
			if (err && err instanceof DescError){
				//Could not find a submission for this assignment by this student. Make one.
				Submission.create(req.user, assignment, function(err, submission){
					if (err){ return helper.sendError(res, 400, err); }

					//add the student's submission info to the assignment
					Course.get(req.params.courseCode, { classrooms: 1 }, function(err, course){
						if (err){ return helper.sendError(res, 400, err); }

						const classroom = course.getClassroomByUserID(req.user._id);
						assignment.addSubmission(classroom, submission);
						assignment.save();


						return helper.sendSuccess(res, { assignment: studentAssignment, submission: submission });
					})
				});
			}else if (err){
				return helper.sendError(res, 400, err);
			}else{
				return helper.sendSuccess(res, { assignment: studentAssignment, submission: submission });
			}
		});
	})
}

module.exports.getSubmissions = function(req, res){
	Assignment.get(req.params.assignmentID, { classSubmissions: 1 }, function(err, assignment){
		if (err){ return helper.sendError(res, 400, err); }

		return helper.sendSuccess(res, assignment.classSubmissions)
	})
}

module.exports.getSubmissionList = function(req, res){
	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const submissionIDs = req.body.submissionIDs;

	Assignment.get(req.params.assignmentID, { classSubmissions: 1 }, function(err, assignment){
		const classroomSubmission = assignment.classSubmissions.find(function(classSub){
			return classSub.classCode === req.params.classCode;
		});

		async.parallel({
			assignment: function(callback){
				Assignment.get(req.params.assignmentID, { pointsWorth: 1 }, function(err, assignment){
					return callback(err, assignment)
				});
			},
			submissions: function(callback){
				console.log(classroomSubmission.submissionIDs);
				Submission
				.getBySubmissionIDs(
					classroomSubmission.submissionIDs, 
					{ studentID: 1, studentName: 1, pointsEarned: 1 }, 

					function(err, submissions){
						return callback(err, submissions)
					}
				)
			}
		}, function(err, results){
			if (err){ return helper.sendError(res, 400, err) }

			return helper.sendSuccess(res, results);
		})

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

			async.series([
				function(callback){
					//delete all previous submissions by students from the last semester/year 
					Submission.deleteByAssignment(assignment, callback);
				},
				function(callback){
					//actually open the assignment now
					assignment.open(dueDate, deadlineType, pointLoss, callback);
				}
			], function(err){
				if (err){ return helper.sendError(res, 400, err); }

				course.addOpenAssignment(assignment);
				course.save();
				
				return helper.sendSuccess(res);
			})
		});
	});
}

module.exports.close = function(req, res){
	req.checkBody('password', 'Please include your password').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const password = req.body.password;

	async.waterfall([
		//Check password
		function(callback){
			req.user.checkPassword(password, function(err, bIsCorrect){
				if (!bIsCorrect){
					return callback(new DescError('Incorrect password', 400));
				}

				return callback(err);
			});
		},
		//close the actual assignment
		function(callback){
			Assignment.get(req.params.assignmentID, { courseID: 1, bIsOpen: 1 }, function(err, assignment){
				assignment.close();
				assignment.save();
				return callback(err, assignment.courseID)
			});
		},
		//remove the assignment from the "open assignments" portion of the course
		function(courseID, callback){
			Course.getByID(courseID, { openAssignments: 1 }, function(err, course){
				course.removeOpenAssignment(req.params.assignmentID);
				course.save(function(err){
					return helper.sendSuccess(res);
				});
			})
		}
	], function(err){
		if (err){ return helper.sendError(res, 400, err) }
		return helper.sendSuccess(res);
	})
}

module.exports.delete = function(req, res){
	req.checkParams('assignmentID', 'Please include the assignmentID').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const assignmentID = req.params.assignmentID;

	Course.get(req.params.courseCode, { assignments: 1 }, function(err, course){
		if (err){ return helper.sendError(res, 400, err); }
		
		course.removeAssignment(assignmentID);

		course.save(function(err, newAssignment){
			if (err) return helper.sendError(res, 400, err);
			return helper.sendSuccess(res);
		});
	});
}