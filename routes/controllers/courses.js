'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	async = require('async'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getCourses = function(req, res){
	Course.find({ _id : { $in : req.user.courses }}, { name: 1, courseCode: 1, assignments: 1 }, function(err, courses){

		var getLastAssignment = function(course, callback){
			if (course.assignments.length <= 0){
				return callback(null, null);
			}

			const a = course.assignments.length - 1; 

			Assignment.findOne(
				{ _id: course.assignments[a] }, 
				{ name: 1, dueDate: 1, pointsWorth: 1 }, 
				function(err, assignment){
					return callback(err, assignment);
			});
		}

		async.map(courses, getLastAssignment, function(err, results){
			for(var i = 0; i < courses.length; i++){
				
				courses[i].assignments = undefined;
				courses[i]._id = undefined;

				if (results[i] !== null){
					courses[i].assignmentName = results[i].name;
					courses[i].assignmentDueDate = results[i].dueDate;
					courses[i].assignmentPoints = results[i].pointsWorth;
				}
			}

			return helper.sendSuccess(res, courses);
		});
	});
}

module.exports.getCourse = function(req, res){
	var projection;
	console.log(req.params.courseCode);

	var projection = { owner: 1, courseCode: 1, name: 1, assignments: { $slice: -5 } };

	//show classrooms if is teacher
	if (req.user.bIsTeacher){
		projection.classrooms = 1;
	}

	Course
	.findOne({ courseCode: req.params.courseCode })
	.select(projection)
	.populate('owner', 'firstName lastName')
	.populate('assignments', 'courseID name description')
	.exec(function(err, course){
		console.log(course);
		if (err) return helper.sendError(res, 400, 3000, helper.errorHelper(err));

		return helper.sendSuccess(res, course);
	});
}

module.exports.create = function(req, res){
	if (req.user.courses.length >= 10){
		return helper.sendError(res, 400, 1001, 'You have already created the maximum amount of courses allowed.');
	}

	var newCourse = new Course({
		owner: req.user._id,
		name: req.body.name,
		courseCode: req.body.courseCode.replace(/\s/g, ''),
		password: req.body.password
	});

	newCourse.save(function(err, course){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		
		//Enroll the user in the course
		req.user.courses.push(course._id);
		req.user.save(function(err, user){
			if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
			return helper.sendSuccess(res);
		});
	});
}

module.exports.changeCourseInfo = function(req, res){
	req.user.checkPassword(req.body.password, function(err, bIsPassword){
		if (!bIsPassword) return helper.sendError(res, 400, 3000, 'Incorrect password.');

		if (course.owner === req.user._id){
			course.name = req.body.name;
			course.password = req.body.password;
			course.save(function(err, course){
				if (err) return  helper.sendError(res, 400, 3000, helper.errorHelper(err));

				return helper.sendSuccess(res);
			})
		} 
	});
}

module.exports.delete = function(req, res){
	req.user.checkPassword(req.body.password, function(err, bIsPassword){
		if (!bIsPassword) return helper.sendError(res, 400, 3000, 'Incorrect password.');

		var course = res.locals.course;

		course.remove(function(err){
			if (err) return helper.sendError(res, 500, 1000, 'Something went wrong with the database');
			
			return helper.sendSuccess(res);
		});
	});
}

module.exports.register = function(req, res){
	//REQUIRES course.identifier, course.password;
	//REQUIRES studentGradebookID

	var identifier = req.body.identifier;
	var courseCode = identifier.substring(0, identifier.indexOf('-'));
	var classCode = identifier.substring(identifier.indexOf('-') + 1, identifier.length);

	Course.findOne({courseCode: courseCode}, function(err, course){
		if (!course) { 
			return helper.sendError(res, 400, 3000, 'Course not found. Code was most likely incorrect.'); 
		}

		if (course.password !== req.body.password){
			return helper.sendError(res, 400, 3000, 'Incorrect password.');
		}

		if (req.user.courses.indexOf(course._id) !== -1){
			return helper.sendError(res, 400, 3000, 'It seems you are already enrolled in this course.');
		}
		//Find user classroom.
		var classroomIndex = -1;

		for (var i = 0; i < course.classrooms.length; i++){
			if (course.classrooms[i].classCode === classCode){
				classroomIndex = i;
				break;
			}
		}

		if (classroomIndex === -1){
			return helper.sendError(res, 400, 3000, 'Classroom not found. Code was most likely incorrect.');
		}

		//Find the user by their name. 
		//If there are more than two students that match the profile, ask them to provide a student ID as well.
		var newStudent = course.classrooms[classroomIndex].students.filter(function(student){
			return student.firstName.toLowerCase() === req.user.firstName.toLowerCase() 
				&& student.lastName.toLowerCase() === req.user.lastName.toLowerCase();
		});

		if (newStudent.length > 1){
			if (typeof req.body.studentGradebookID === 'undefined'){
				return helper.sendError(res, 400, 3001, 'There are multiple students with that name.'+
					'Please enter your student ID.');
			}else{
				//Find user by the gradebook id they put in 
				newStudent = course.classrooms[classroomIndex].students.filter(function(student){
					return student.gradebookID === req.body.studentGradebookID;
				});
			}
		}else if (newStudent.length === 0){
			return helper.sendError(res, 400, 1001, 
				'Your teacher has not included you in the list of students.' +
				'Please ask them to enter in a new student using the first and last name you signed up with');
		}

		if (typeof newStudent[0].userID === 'undefined' && newStudent.length === 1){
			newStudent[0].userID = req.user._id;
		}else{
			return helper.sendError(res, 400, 3000, 'It seems you\'ve already registered');
		}

		async.parallel({
			user: function(callback){
				req.user.courses.push(course._id);
				req.user.courseCodes.push(course.courseCode);
				req.user.save(function(err){
					callback(err);
				});
			},
			course: function(callback){
				course.save(function(err){
					callback(err);
				});
			}
		}, function(err, results){
			if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));

			return helper.sendSuccess(res);
		});
	});
}