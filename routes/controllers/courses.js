'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	async = require('async'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	if (req.user.courses.length >= 10){
		return res.render('pages/course/creation.ejs', 
			{ message: 'You have already created the maximum amount of courses allowed.' });
	}

	var newCourse = new Course({
		owner: req.user._id,
		courseName: req.body.courseName,
		coursePassword: req.body.coursePassword
	});

	newCourse.save(function(err, course){
		if (err) return res.render('pages/general/creation.ejs', { message: helper.errorHelper(err) });
		
		//Enroll the user in the course
		req.user.courses.push(course._id);
		req.user.save(function(err, user){
			return res.redirect('/course/' + course.courseID);
		});
	});
}

module.exports.changeCourseInfo = function(req, res){
	req.user.checkPassword(req.body.password, function(err, bIsPassword){
		if (!bIsPassword) return res.render('pages/course/creation.ejs', { message: 'Incorrect password.' });

		var course = res.locals.course;

		if (course.owner === req.user._id){
			course.courseName = req.body.courseName;
			course.coursePassword = req.body.coursePassword;
			course.save(function(err, course){
				if (err) return res.render('pages/course/creation.ejs', { message: helper.errorHelper(err) });
				return res.redirect('/course' + course.courseID);
			})
		} 
	});
}

module.exports.showCourse = function(req, res){
	if (req.user.bIsTeacher){
		return res.render('pages/course/courseTeacher.ejs');
	}else{
		return res.render('pages/course/courseStudent.ejs');
	}
}

module.exports.showCourseCreation = function(req, res){
	res.render('pages/course/creation.ejs');
}

module.exports.getUserCourses = function(req, res){
	
}