'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.getCourse = function(req, res){
	const projection = { owner: 1, courseCode: 1, name: 1, openAssignments: 1 };

	Course.getWithOpenAssignments(req.params.courseCode, projection, function(err, course){
		console.log(err)
		if (err) return helper.sendError(res, 500, err);
		return helper.sendSuccess(res, course);
	});
}

module.exports.getCourses = function(req, res){
	Course.getCourseList(req.user.courses, { name: 1, courseCode: 1, openAssignments: 1 }, function(err, courses){
		console.log(err);
		if (err) return helper.sendError(res, 500, err);

		return helper.sendSuccess(res, courses);
	});
}

module.exports.create = function(req, res){
	req.checkBody('name', 'Please include the course name.').notEmpty();
	req.checkBody('courseCode', 'Course code must be between 3-20 characters').notEmpty().isLength({min: 3, max: 20});
	req.checkBody('password', 'Course password must be between 5-20 characters').notEmpty().isLength({min: 5, max: 20});
	req.checkBody('defaultLanguage', 'Please select a language.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Course.create(req.user, req.body, function(err, courseID){
		if (err) { return helper.sendError(res, 400, err) };

		req.user.addCourse(courseID);

		req.user.save(function(err){
			if (err) { return helper.sendError(res, 400, err) };

			return helper.sendSuccess(res, { courseID: courseID });
		});
	});
}

module.exports.changeInfo = function(req, res){
	req.checkBody('name', 'Please include the course name.').notEmpty();
	req.checkBody('coursePassword', 'Course password must be between 5-20 characters').notEmpty().isLength({min: 5, max: 20});
	req.checkBody('teacherPassword', 'Course password must be between 5-20 characters').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const edit = {
		name: req.body.name,
		coursePassword: req.body.coursePassword
	}

	Course.get(req.params.courseCode, { name: 1, password: 1 }, function(err, course){
		if (err) { return helper.sendError(res, 400, err) };

		req.user.checkPassword(info.teacherPassword, function(err, bIsPassword){
			if (err){ return helper.sendError(res, 400, err) }
			if (!bIsPassword){ return helper.sendError(res, 400, new DescError('Incorrect password.'), 400) }

			err = course.changeInfo(user, edit);
			if (err){ return helper.sendError(res, 400, err) };

			course.save(function(err){
				if (err) { return helper.sendError(res, 400, err) };

				return helper.sendSuccess(res);
			});
		})
	})
}

module.exports.delete = function(req, res){
	req.checkBody('password', 'Please include your password.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	req.user.checkPassword(req.body.password, function(err, bIsCorrect){
		if (!bIsPassword){ return callback(new DescError('Invalid password'), 400); }

		Course.get(req.params.courseCode, { _id: 1}, function(err, course){
			req.user.removeCourse(course._id);

			course.remove(function(err){
				if (err) { return helper.sendError(res, 400, err) };

				req.user.save(function(err){
					if (err) { return helper.sendError(res, 400, err) };

					return helper.sendSuccess(res);
				})
			})
		})
	});
}

module.exports.register = function(req, res){
	//REQUIRES course.identifier, course.password;
	//REQUIRES studentGradebookID

	req.checkBody('identifier', 'Please include the course identifier.').notEmpty();
	req.checkBody('password', 'Please include the course password.').notEmpty();
	req.checkBody('gradebookID', 'Please include your student ID.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }
	
	const identifier = req.body.identifier;
	const courseCode = identifier.substring(0, identifier.indexOf('-'));
	const classCode = identifier.substring(identifier.indexOf('-') + 1, identifier.length);
	const password = req.body.password;
	const gradebookID = req.body.gradebookID;

	Course.get(courseCode, { classrooms: 1, password: 1, courseCode: 1 }, function(err, course){
		if (err) { return helper.sendError(res, 400, err) };

		var classroom = course.parseRegistrationCode(req.user, classCode, password);

		if (classroom instanceof DescError){
			return helper.sendError(res, 400, err);
		}

		classroom.linkStudentToUser(req.user, gradebookID);

		course.save(function(err){
			if (err) { return helper.sendError(res, 400, err) };

			req.user.addCourse(course._id);

			req.user.save(function(err){
				if (err) { return helper.sendError(res, 400, err) };

				return helper.sendSuccess(res);
			});
		});
	})
}