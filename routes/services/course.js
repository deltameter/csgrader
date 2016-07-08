/*'use strict';

var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	async = require('async'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.get = function(courseCode, projection, callback){
	Course.findOne({ courseCode: courseCode }, projection, function(err, course){
		if (err){ return callback(err) }
		if (!course){ return callback(new DescError('That course was not found'), 400); }
		return callback(null, course);
	})
}

module.exports.getUserCourse = function(user, courseCode, projection, callback){
	const assignmentFilter = { bIsOpen: true };

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

module.exports.getCourseList = function(user, callback){
	Course.find({ _id : { $in : user.courses }}, { name: 1, courseCode: 1, openAssignments: 1 }, function(err, courses){
		return callback(null, courses);
	})
}

module.exports.getClassrooms = function(courseCode, projection, callback){
	Course.aggregate(
		{ $match: { courseCode: courseCode } },
		{ $project: { _id: 0, classrooms: 1 } },
		{ $unwind: '$classrooms' },
		{ $project: projection },
		{ $sort: { name: 1 } },
		function(err, classrooms){
			if (err){ return callback(new DescError('An error occured while getting these classrooms.', 400), null) };
			return callback(null, classrooms);
		}
	);
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

		return callback(null, course._id);
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

	if (user.courses.indexOf(course._id) !== -1){
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

	course.save(function(err){
		if (err) return callback(err);

		return callback(null, null);
	});
}*/