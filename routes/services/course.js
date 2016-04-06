'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	async = require('async'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.getCourse = function(courseCode, projection, callback){
	Course.findOne({ courseCode: courseCode }, projection, function(err, course){
		if (err){ return callback(err) }
		if (!course){ return callback(new DescError('That course was not found'), 400); }
		return callback(null, course);
	})
}

module.exports.getUserCourse = function(user, courseCode, projection, callback){
	var assignmentFilter = { bIsOpen: true };

	//show classrooms if is teacher
	if (user.role === 'teacher'){
		projection.classrooms = 1;
		delete assignmentFilter.bIsOpen;
	}

	Course
	.findOne({ courseCode: courseCode })
	.select(projection)
	.populate('owner', 'firstName lastName')
	.populate('assignments', 'courseID name description', assignmentFilter)
	.exec(function(err, course){

		if (err) { return callback(err) }

		return callback(null, course);
	});
}

module.exports.getUsersCourses = function(user, callback){
	Course.find({ _id : { $in : user.courses }}, { name: 1, courseCode: 1, assignments: 1 }, function(err, courses){
		var getLastAssignment = function(course, cb){
			if (course.assignments.length <= 0){
				return cb(null, null);
			}

			const a = course.assignments.length - 1; 

			Assignment.findOne(
				{ _id: course.assignments[a] }, 
				{ name: 1, dueDate: 1, pointsWorth: 1 }, 
				function(err, assignment){
					return cb(err, assignment);
			});
		}

		async.map(courses, getLastAssignment, function(err, results){
			if (err) { return callback(err, null); }

			for(var i = 0; i < courses.length; i++){
				
				courses[i].assignments = undefined;
				courses[i]._id = undefined;

				if (results[i] !== null){
					courses[i].assignmentName = results[i].name;
					courses[i].assignmentDueDate = results[i].dueDate;
					courses[i].assignmentPoints = results[i].pointsWorth;
				}
			}

			return callback(null, courses);
		});
	})
}

module.exports.create = function(user, courseInfo, callback){
	if (user.courses.length >= 10){
		return callback(new DescError('You already have the maximum amount of courses allowed.'), 400);
	}

	var newCourse = new Course({
		owner: user._id,
		name: courseInfo.name,
		courseCode: courseInfo.courseCode.replace(/\s/g, ''),
		password: courseInfo.password,
		defaultLanguage: languageHelper.findByString(courseInfo.defaultLanguage).definition.langID
	});

	newCourse.save(function(err, course){
		if (err) return callback(err, null);

		//Enroll the user in the course
		user.courses.push(course._id);

		user.save(function(err, user){
			if (err) return callback(err, null);
			return callback(null, course._id);
		});
	});
}

module.exports.changeInfo = function(user, course, info, callback){
	user.checkPassword(info.teacherPassword, function(err, bIsPassword){
		if (!bIsPassword){ return callback(new DescError('Invalid password'), 400); }

		if (course.owner === user._id){
			course.name = info.name;
			course.password = info.coursePassword;

			course.save(function(err, course){
				if (err) { return callback(err) };

				return callback(null);
			})
		}else{
			return callback(new DescError('Must be the course owner to do this.'), 400);
		}
	});
}

module.exports.delete = function(user, course, info, callback){
	user.checkPassword(info.password, function(err, bIsPassword){
		if (!bIsPassword){ return callback(new DescError('Invalid password'), 400); }

		if (course.owner === user._id){
			course.remove(function(err){
				if (!bIsPassword){ return callback(err, 500); }
				
				return helper.sendSuccess(res);
			});
		}else{
			return callback(new DescError('Must be the course owner to do this.'), 400);
		}
	});
}

module.exports.register = function(user, course, classCode, regInfo, callback){
	if (course.password !== regInfo.password){
		return callback(new DescError('Invalid password'), 400);
	}

	if (
		user.courses.indexOf(course._id) !== -1){
		return callback(new DescError('Already enrolled'), 400);
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
		return callback(new DescError('Incorrect code'), 400);
	}

	//Find the user by their name. 
	//If there are more than two students that match the profile, ask them to provide a student ID as well.
	var newStudent = course.classrooms[classroomIndex].students.find(function(student){
		return student.lastName.toLowerCase() === user.lastName.toLowerCase()
			&& student.gradebookID === regInfo.gradebookID;
	});

	if (!newStudent){
		return callback(new DescError('Not part of this class'), 400);
	}

	if (typeof newStudent.userID === 'undefined'){
		newStudent.userID = user._id;
	}else{
		return callback(new DescError('Already registered'), 400);
	}

	async.parallel({
		user: function(callback){
			user.courses.push(course._id);
			user.courseCodes.push(course.courseCode);
			user.save(function(err){
				callback(err);
			});
		},
		course: function(callback){
			course.save(function(err){
				callback(err);
			});
		}
	}, function(err, results){
		if (err) return callback(err);

		return callback(null, { courseCode: course.courseCode });
	});
}