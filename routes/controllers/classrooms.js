'use strict';

var mongoose = require('mongoose'),
	Classroom = mongoose.model('Classroom'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var newClassroom = new Classroom({
		teacher: req.user._id,
		name: req.body.name
	});

	var course = res.locals.course;
	if (course.classrooms.length >= 10){
		return helper.sendError(res, 401, 'You already have the maximum allowed number of classrooms');
	}

	course.classrooms.push(newClassroom);

	course.save(function(err, course){
		if (err) console.log(err); 
	});
}

module.exports.register = function(req, res){
	return res.sendStatus(200);
}

module.exports.showClassroomCreation = function(req, res){
	return res.sendStatus(200);
}