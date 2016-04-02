'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = require(__base + 'routes/services/course'),
	Assignment = mongoose.model('Assignment'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	async = require('async'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getCourses = function(req, res){
	Course.getUsersCourses(req.user, function(err, courses){
		if (err) return helper.sendError(res, 500, err);

		return helper.sendSuccess(res, courses);
	});
}

module.exports.getCourse = function(req, res){
	const projection = { owner: 1, courseCode: 1, name: 1, assignments: { $slice: -5 } };

	Course.getUserCourse(req.user, req.params.courseCode, projection, function(err, course){
		if (err) return helper.sendError(res, 500, err);
		return helper.sendSuccess(res, course);
	});
}

module.exports.create = function(req, res){
	Course.create(req.user, req.body, function(err, courseID){
		if (err) { return helper.sendError(res, 400, err) };

		return helper.sendSuccess(res, { courseID: courseID });
	});
}

module.exports.changeInfo = function(req, res){
	Course.getCourse(req.params.courseCode, { name: 1, password: 1 }, function(course, err){
		if (err) { return helper.sendError(res, 400, err) };

		Course.changeInfo(user, course, req.body, function(err){
			if (err) { return helper.sendError(res, 400, err) };

			return helper.sendSuccess(res);
		});
	})
}

module.exports.delete = function(req, res){
	Course.getCourse(req.params.courseCode, { _id: 1 }, function(course, err){
		if (err) { return helper.sendError(res, 400, err) };
		
		Course.changeInfo(user, course, req.body, function(err){
			if (err) { return helper.sendError(res, 400, err) };

			return helper.sendSuccess(res);
		});
	})
}

module.exports.register = function(req, res){
	//REQUIRES course.identifier, course.password;
	//REQUIRES studentGradebookID

	const identifier = req.body.identifier;
	const courseCode = identifier.substring(0, identifier.indexOf('-'));
	const classCode = identifier.substring(identifier.indexOf('-') + 1, identifier.length);

	Course.getCourse(courseCode, { classrooms: 1, password: 1, courseCode: 1 }, function(err, course){
		if (err) { return helper.sendError(res, 400, err) };

		Course.register(req.user, course, classCode, req.body, function(err){
			if (err) { return helper.sendError(res, 400, err) };

			return helper.sendSuccess(res);
		});
	})
}