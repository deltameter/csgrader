'use strict';

const mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Classroom = mongoose.model('Classroom'),
	async = require('async'),
	User = mongoose.model('User'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	helper = require(__base + 'routes/libraries/helper');

module.exports.getClassroom = function(req, res){
	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		return helper.sendSuccess(res, classroom);
	});
}

module.exports.getClassrooms = function(req, res){
	const projection = { 
		name: '$classrooms.name', 
		classCode: '$classrooms.classCode',
		studentNum: { $size: '$classrooms.students' } 
	}

	Course.getClassroomsList(req.params.courseCode, projection, function(err, classrooms){
		return helper.sendSuccess(res, classrooms);
	});
}

module.exports.create = function(req, res){
	req.checkBody('name', 'Please include the class name.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const name = req.body.name;

	Course.get(req.params.courseCode, { classrooms: 1 }, function(err, course){
		var classroom = Classroom.create(req.user, name, course.classrooms)

		course.addClassroom(classroom);

		course.save(function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res, classroom);
		});
	});
}

module.exports.deleteClassroom = function(req, res){
	req.checkParams('classCode', 'Please include the class name.').notEmpty();
	req.checkBody('password', 'Please include your password.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const classCode = req.params.classCode;
	const password = req.body.password;

	Course.get(req.params.courseCode, { classrooms: 1 }, function(err, course){

		if (course.getClassroom(classCode).teacher.toString() !== req.user._id.toString()){
			return helper.sendError(res, 400, new DescError('You do not own this classroom', 400));
		}

		req.user.checkPassword(password, function(err, bIsCorrect){
			if (!bIsCorrect){
				return helper.sendError(res, 400, new DescError('Incorrect password.', 400));
			}

			course.deleteClassroom(classCode);

			course.save(function(err){
				if (err){ return helper.sendError(res, 400, err) };
				return helper.sendSuccess(res);
			});

		})
	});
}

module.exports.importStudents = function(req, res){
	//REQUIRES classroom.classCode, csv file
	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		classroom.addStudentsByCSV(req.file.buffer, function(err, allStudents){
			if (err){ return helper.sendError(res, 400, err) };

			course.save(function(err){
				if (err){ return helper.sendError(res, 400, err) };
				return helper.sendSuccess(res, allStudents);
			})
		})
	});
}

module.exports.addStudent = function(req, res){
	//REQUIRES classroom._id, student.firstname, student.lastname, student.gradebook
	req.checkBody('firstName', 'Please include the student\'s first name').notEmpty();
	req.checkBody('lastName', 'Please include your student\'s last name.').notEmpty();
	req.checkBody('gradebookID', 'Please include your student\'s gradebookID.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		if (err){ return helper.sendError(res, 400, err) };
		if (!course || !classroom){ return helper.sendError(res, 400, new DescError('Course or classroom not found'), 400) }

		var student = classroom.addStudent(req.body);

		course.save(function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res, student);
		});
	});
}

module.exports.editStudent = function(req, res){
	//REQUIRES classroom.student._id as studentClassID
	req.checkBody('studentClassID', 'Please include the student\'s first name').isMongoId();
	req.checkBody('firstName', 'Please include the student\'s first name').notEmpty();
	req.checkBody('lastName', 'Please include your student\'s last name.').notEmpty();
	req.checkBody('gradebookID', 'Please include your student\'s gradebookID.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const studentClassID = req.body.studentClassID;
	const editInfo = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		gradebookID: req.body.gradebookID
	}

	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		if (err){ return helper.sendError(res, 400, err) };

		err = classroom.editStudent(studentClassID, editInfo);
		if (err){ return helper.sendError(res, 400, err) };

		course.save(function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		})
	});
}

module.exports.deleteStudent = function(req, res){
	//REQUIRES classroom.student._id
	req.checkParams('studentClassID', 'Please include the student\'s ID').isMongoId();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	const studentClassID = req.params.studentClassID;

	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		if (err){ return helper.sendError(res, 400, err) };

		async.waterfall([
			//delete user from course
			function(callback){
				var deleteUserID = classroom.deleteStudent(studentClassID);

				if (typeof deleteUserID !== 'undefined' && deleteUserID instanceof DescError){
					return callback(deleteUserID, null)
				}

				course.save(function(err){
					return callback(null, deleteUserID)
				});
			},
			//then delete course from user's list
			function(deleteUserID, callback){
				if (typeof deleteUserID === 'undefined'){ return callback(null) }

				User.findByID(deleteUserID, function(err, user){
					user.removeCourse(course._id);
					user.save();
					callback(err);
				})
			}
		], function(err){
			if (err){ return helper.sendError(res, 400, err) };
			return helper.sendSuccess(res);
		});

	});
}

module.exports.exportGrades = function(req, res){
	Course.getWithClassroom(req.params.courseCode, req.params.classCode, { classrooms: 1 }, function(err, course, classroom){
		const studentIDs = classroom.students.map(function(student){ return student.userID });
	 	async.parallel({
	 		submissions: function(callback){
				Submission
				.find({ assignmentID: req.params.assignmentID, studentID: { $in : studentIDs } },
				{ studentID: 1, pointsEarned: 1 }, 
				function(err, submissions){
					callback(err, submissions);
				});
	 		},
	 		assignment: function(callback){
	 			Assignment.get(req.params.assignmentID, { pointsWorth: 1 }, function(err, assignment){
	 				callback(err, assignment);
	 			});
	 		}
	 	}, function(err, results){
	 		var assignment = results.assignment;
	 		var submissions = results.submissions;

			if (err){
				return helper.sendError(res, 400, err)
			}

			if (submissions.length === 0){
				return helper.sendError(res, 400, new DescError('No submissions for that assignment.', 400));
			}

			if (!assignment){
				return helper.sendError(res, 400, new DescError('Assignment does not exist', 400));
			}

			classroom.exportGrades(assignment, submissions, function(err, completedCSV){
				if (err){ return helper.sendError(res, 400, err) };
				return helper.sendSuccess(res, { csv: completedCSV });
			});
	 	});
	});
}

