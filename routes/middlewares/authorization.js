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
	if (!req.user.bIsTeacher) return next();

	return helper.sendError(res, 401, 'You must be a student to access this.');
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.bIsTeacher) return next();

	return helper.sendError(res, 401, 'You must be a teacher to access this.');
}