var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	DescError = require(__base + '/routes/libraries/errors').DescError;
	helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated() && req.user.bHasActivatedAccount){
		return next();
	}

	return helper.sendError(res, 401, new DescError('Please log in.', 400));
}

module.exports.requiresStudent = function(req, res, next){
	if (req.user.role === 'student') return next();

	return helper.sendError(res, 401, new DescError('You must be a student to access this.', 400));
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.role === 'teacher') return next();

	return helper.sendError(res, 401, new DescError('You must be a teacher to access this.', 400));
}

module.exports.requiresEnrollment = function(req, res, next){
	if (typeof req.session.authorizedCourses === 'undefined' || 
		req.session.authorizedCourses.indexOf(req.params.courseCode) === -1){

		Course.findOne({courseCode: req.params.courseCode}, function(err, course){
			if (err){
				return helper.sendError(res, 500, new DescError(
					'An error occured while you were trying to access the database. Please try again.', 400));
			}
			if (!course){ 
				return helper.sendError(res, 404, new DescError('That course does not exist.', 400));
			}
			//If the student is not enrolled in this course, don't let them view it
			if (req.user.courses.indexOf(course._id) === -1){
				return helper.sendError(res, 401, new DescError('You must be enrolled in this course to access it.', 400));
			}

			if (typeof req.session.authorizedCourses === 'undefined'){
				req.session.authorizedCourses = [];
			}

			req.session.authorizedCourses.push(req.params.courseCode);
			req.session.save();

			return next();
		});	
	}else{
		return next();
	}
}

module.exports.requiresAssignment = function(req, res, next){
	if (typeof req.session.authorizedAssignments === 'undefined' || 
		req.session.authorizedAssignments.indexOf(req.params.assignmentID) === -1){

		Assignment.findOne({ _id : req.params.assignmentID }, function(err, assignment){
			if (err){
				return helper.sendError(res, 500, new DescError(
					'An error occured while you were trying to access the database. Please try again.', 400));
			}

			if (!assignment){ 
				return helper.sendError(res, 404, new DescError('That assignment does not exist.', 400));
			}

			if (req.user.courses.indexOf(assignment.courseID) === -1){
				return helper.sendError(res, 401, new DescError('You must be enrolled in this course to access it.', 400));
			}

			if (!assignment.isAssignmentOpen() && req.user.role !== 'teacher'){
				return helper.sendError(res, 404, new DescError('That assignment does not exist or is not available.', 400));
			}

			if (typeof req.session.authorizedAssignments === 'undefined'){
				req.session.authorizedAssignments = [];
			}

			req.session.authorizedAssignments.push(req.params.assignmentID);
			req.session.save();

			return next();
		});
	}else{
		return next();
	}
};