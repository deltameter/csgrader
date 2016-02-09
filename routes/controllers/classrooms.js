'use strict';

var mongoose = require('mongoose'),
	Classroom = mongoose.model('Classroom'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var course = res.locals.course;

	var newClassroom = new Classroom({
		teacher: req.user._id,
		name: req.body.name
	});

	
	if (course.classrooms.length >= 10){
		return helper.sendError(res, 403, 'You already have the maximum allowed number of classrooms');
	}

	course.classrooms.push(newClassroom);

	course.save(function(err, course1){
		if (err) console.log(err); 
		return res.redirect('/course/' + course.courseID);
	});
}

module.exports.showClassroomCreation = function(req, res){
	return res.render('pages/classroom/creation.ejs');
}