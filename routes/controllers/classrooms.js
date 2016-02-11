'use strict';

var mongoose = require('mongoose'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var course = res.locals.course;

	var newClassroom = new Classroom({
		teacher: req.user._id,
		name: req.body.name
	});

	if (course.classrooms.length >= 10){
		return helper.sendError(res, 400, 'You already have the maximum allowed number of classrooms');
	}

	course.classrooms.push(newClassroom);

	course.save(function(err, course){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));

		if (config.env === 'test'){
			return helper.sendSuccess(res, 
				{ classroomID: newClassroom._id,
					classCode: newClassroom._id.toString().substring(0, Classroom.properties.classIdentifierLength) });
		}

		return helper.sendSuccess(res);
	});
}

module.exports.addStudent = function(req, res){
	//REQUIRES classroom._id, student.firstname, student.lastname, student.gradebook
	var course = res.locals.course;

	var classroom = course.classrooms.find(function(classroom){
		return classroom._id = req.body.classroomID;
	});

	var newStudent = new Student({
		gradebookID: req.body.gradebookID,
		firstName: req.body.firstName,
		lastName: req.body.lastName
	});

	classroom.students.push(newStudent);

	course.save(function(err, classroom){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}