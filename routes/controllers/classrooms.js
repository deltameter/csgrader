'use strict';

const mongoose = require('mongoose'),
	Classroom = require(__base + 'routes/services/classroom'),
	Course = require(__base + 'routes/services/course'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getClassroom = function(req, res){
	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		return helper.sendSuccess(res, classroom);
	});
}

module.exports.getClassrooms = function(req, res){
	Course.getCourse(req.params.courseCode, { classrooms: 1 }, function(err, course){
		return helper.sendSuccess(res, course.classrooms);
	});
}

module.exports.create = function(req, res){
	Course.getCourse(req.params.courseCode, { classrooms: 1 }, function(err, course){
		Classroom.create(req.user, course, req.body, function(err, newClassroom){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res, newClassroom);
		})
	});
}

module.exports.deleteClassroom = function(req, res){
	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.delete(course, classroom, function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

module.exports.importStudents = function(req, res){
	//REQUIRES classroom.classCode, csv file
	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.importStudents(course, classroom, req.file.buffer, function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

module.exports.addStudent = function(req, res){
	//REQUIRES classroom._id, student.firstname, student.lastname, student.gradebook

	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.addStudent(course, classroom, req.body, function(err, newStudent){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res, newStudent);
		})
	});
}

module.exports.editStudent = function(req, res){
	//REQUIRES classroom.student._id
	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.editStudent(course, classroom, req.body, function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

module.exports.deleteStudent = function(req, res){
	//REQUIRES classroom.student._id

	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.deleteStudent(course, classroom, req.params.studentClassID, function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

module.exports.exportGrades = function(req, res){
	//requires assignment.ID
	Classroom.get(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		Classroom.editStudent(course, classroom, req.body.assignmentID, function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

