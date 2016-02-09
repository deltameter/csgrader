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
		name: req.body.name,
		password: req.body.password
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
			course.name = req.body.name;
			course.password = req.body.password;
			course.save(function(err, course){
				if (err) return res.render('pages/course/creation.ejs', { message: helper.errorHelper(err) });
				return res.redirect('/course' + course.courseID);
			})
		} 
	});
}

module.exports.showCourse = function(req, res){
	console.log('show');
	if (req.user.bIsTeacher){
		return res.render('pages/course/courseTeacher.ejs');
	}else{
		return res.render('pages/course/courseStudent.ejs');
	}
}

module.exports.showCourseCreation = function(req, res){
	res.render('pages/course/creation.ejs');
}

module.exports.joinCourse = function(req, res){
	console.log('join course reached');
	var identifier = req.body.identifier;
	var courseID = identifier.substring(0, identifier.indexOf('-'));
	var classroom = parseInt(identifier.substring(identifier.indexOf('-') + 1, identifier.length), 10);

	Course.findOne({courseID: courseID}, function(err, course){
		if (!course) return res.render('pages/user/profile.ejs', { message: 'course not found' });
		if (course.password !== req.body.password){
			return res.render('pages/user/profile.ejs', { message: 'incorredct password' });
		}
		if (typeof course.classrooms[classroom] === 'undefined'){
			return res.render('pages/user/profile.ejs', { message: 'classroom not there' });
		}

		async.parallel({
			user: function(callback){
				req.user.courses.push(course._id);
				req.user.save(function(err){
					callback(err);
				});
			},
			course: function(callback){
				course.classrooms[classroom].students.push(req.user._id);
				course.save(function(err){
					callback(err);
				});
			}
		}, function(err, results){
			console.log(err);
			return res.redirect('/course/' + course.courseID);
		});
	});
}