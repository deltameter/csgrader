var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated() && req.user.bHasActivatedAccount){
		return next();
	}

	return helper.sendError(res, 401, 'Please log in.');
}

module.exports.requiresStudent = function(req, res, next){
	if (req.user.role === 'student') return next();

	return helper.sendError(res, 401, 'You must be a student to access this.');
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.role === 'teacher') return next();

	return helper.sendError(res, 401, 'You must be a teacher to access this.');
}

module.exports.requiresEnrollment = function(req, res, next){
	if (typeof req.session.authorizedCourses === 'undefined' || 
		req.session.authorizedCourses.indexOf(req.params.courseCode) === -1){

		Course.findOne({courseCode: req.params.courseCode}, function(err, course){
			if (err){
				return helper.sendError(res, 500, 1000, 
					'An error occured while you were trying to access the database. Please try again.');
			}
			if (!course){ 
				return helper.sendError(res, 404, 1001, 'That course does not exist.');
			}
			//If the student is not enrolled in this course, don't let them view it
			if (req.user.courses.indexOf(course._id) === -1){
				return helper.sendError(res, 401, 2002, 'You must be enrolled in this course to access it.');
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
				return helper.sendError(res, 500, 1000, 
					'An error occured while you were trying to access the database. Please try again.');
			}

			if (!assignment){ 
				return helper.sendError(res, 404, 1001, 'That assignment does not exist.');
			}

			if (req.user.courses.indexOf(assignment.courseID) === -1){
				return helper.sendError(res, 401, 2002, 'You must be enrolled in this course to access it.');
			}

			if (!assignment.isAssignmentOpen() && req.user.role !== 'teacher'){
				return helper.sendError(res, 404, 1001, 'That assignment does not exist or is not available.');
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