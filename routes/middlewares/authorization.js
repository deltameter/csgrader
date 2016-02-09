var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated()) return next();
	if (req.method == 'GET') req.session.returnTo = req.originalUrl;

	return helper.sendError(res, 401, 2000,  'Please log in.');
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.bIsTeacher) return next();

	return helper.sendError(res, 401, 2001, 'You must be a teacher to access this.');
}

module.exports.requiresEnrollment = function(req, res, next){
	Course.findOne({courseID: req.params.courseID}, function(err, course){
		if (err) { 
			return helper.sendError(res, 401, 1000, 
				'An error occured while you were trying to access the database. Please try again.');
		}
		if (!course){ 
			return helper.sendError(res, 404, 1001, 'That course does not exist.');
		}
		//If the student is not enrolled in this course, don't let them view it
		if (req.user.courses.indexOf(course._id) === -1){
			return helper.sendError(res, 401, 2002, 'You must be enrolled in this course to access it.');
		}

		res.locals.course = course;
		return next();
	});
}

module.exports.requiresAssignmentExistance = function(req, res, next){
	var aIndex = parseInt(req.params.assignmentID, 10);

	if (typeof res.locals.course.assignments[aIndex] == 'undefined'
		|| (!res.locals.course.assignments[aIndex].bIsOpen && !req.user.bIsTeacher)){
		return helper.sendError(res, 404, 1001, 'That assignment does not exist or is not available.');
	}
	
	res.locals.aIndex = aIndex;
	return next();
};