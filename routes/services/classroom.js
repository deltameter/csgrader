'use strict';

const mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Classroom = mongoose.model('Classroom'),
	Student = mongoose.model('Student'),
	User = mongoose.model('User'),
	async = require('async'),
	config = require(__base + 'app/config'),
	csv = require('csv'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.get = function(courseCode, classCode, projection, callback){
	Course.findOne({ courseCode: courseCode }, projection, function(err, course){
		var classroomIndex = -1;

		for(var i = 0; i < course.classrooms.length; i++){
			if (course.classrooms[i].classCode === classCode){
				classroomIndex = i;
				break;
			}
		}

		if (classroomIndex === -1){
			return callback(new DescError('That class was not found'), 400);
		}

		return callback(err, course, course.classrooms[classroomIndex]);
	});
}	

module.exports.create = function(teacher, course, classInfo, callback){
	if (course.classrooms.length >= 10){
		return helper.sendError(res, 400, 'You already have the maximum allowed number of classrooms');
	}

	//create a random classCode and make sure it doesn't collide
	//more or less a while true, but less scary
	var classCode = '';
	
	for (var a = 0; a < 100; a++){
		var bIsUnique = true;
		classCode = require('crypto').randomBytes(2).toString('hex');

		for (var i = 0; i < course.classrooms.length; i++){
			if (course.classrooms[i].classCode === classCode){
				bIsUnique = false;
				break;
			}
		}

		if (bIsUnique){
			break;
		}
	}

	var newClassroom = new Classroom({
		teacher: teacher._id,
		name: classInfo.name,
		classCode: classCode
	});

	course.classrooms.push(newClassroom);

	course.save(function(err, course){
		return callback(err, newClassroom);
	});
}

module.exports.delete = function(course, classroom, callback){
	var classIndex = course.classrooms.map(function(e) { return e.classCode; }).indexOf(classroom.classCode);
	course.classrooms.splice(classIndex, 1);

	course.save(function(err){
		return callback(err);
	});
}

module.exports.importStudents = function(course, classroom, csvFile, callback){
	var columnSelector = function(columns){
		for (var i = 0; i < columns.length; i++){
			//remove spaces and capitals
			columns[i] = columns[i].replace(/ /g,'').toLowerCase();
		}
		return columns;
	}

	csv.parse(csvFile, { trim: true, columns: columnSelector }, function(err, students){
		if (err || students.length === 0){
			return callback(new DescError('No student records in that CSV.', 400), null);
		}

		if (typeof students[0].gradebookid === 'undefined'){
			return callback(new DescError('Please include a "Gradebook ID" column.', 400), null);
		}
		if (typeof students[0].firstname === 'undefined'){
			return callback(new DescError('Please include a "First Name" column.', 400), null);
		}
		if (typeof students[0].gradebookid === 'undefined'){
			return callback(new lastname('Please include a "Last Name" column.', 400), null);
		}

		for (var i = 0; i < students.length; i++){
			var newStudent = new Student({
				gradebookID: students[i].gradebookid,
				firstName: students[i].firstname,
				lastName: students[i].lastname
			});

			classroom.students.push(newStudent);
		}

		course.save(function(err, course){
			return callback(err);
		});
	});
}

module.exports.addStudent = function(course, classroom, studentInfo, callback){
	var newStudent = new Student({
		gradebookID: studentInfo.gradebookID,
		firstName: studentInfo.firstName,
		lastName: studentInfo.lastName
	});

	classroom.students.push(newStudent);

	course.save(function(err, course){
		return callback(err, newStudent);
	});
}

module.exports.editStudent = function(course, classroom, studentInfo, callback){
	//IMPORTANT, this is the ID of the STUDENT model, not the USER model!!!
	const studentClassID = studentInfo.studentClassID;

	var studentIndex = -1;

	for (var i = 0; i < classroom.students.length; i++){
		if (classroom.students[i]._id.toString() === studentClassID){
			studentIndex = i;
			break;
		}
	}

	classroom.students[studentIndex].gradebookID = studentInfo.gradebookID;
	classroom.students[studentIndex].firstName = studentInfo.firstName;
	classroom.students[studentIndex].lastName = studentInfo.lastName;

	course.save(function(err){
		callback(err);
	});
}

module.exports.deleteStudent = function(course, classroom, studentClassID, callback){
	//IMPORTANT, studentClassID is the ID of the STUDENT model, not the USER model!!!

	var sI = -1;
	//use this to delete the course from the user
	var studentUserID;

	for (var i = 0; i < classroom.students.length; i++){
		if (classroom.students[i]._id.toString() === studentClassID){
			sI = i;
			break;
		}
	}

	studentUserID = classroom.students[sI].userID;
	classroom.students.splice(sI, 1);

	course.save(function(err){
		if (err) return helper.sendError(res, 400, err);

		//remove course from student's courses array
		if (typeof studentUserID !== 'undefined'){
			User.findOne({ _id: studentUserID }, function(err, user){
				var courseIndex = user.courses.indexOf(course._id);
				user.courses.splice(courseIndex, 1);
				user.markModified('courses');
				user.save();

				return callback(err);
			});
		}else{
			return callback(err);
		}
	});
}

module.exports.exportGrades = function(course, classroom, assignmentID, callback){
	var studentIDs = new Array(classroom.students.length);

	for(var i = 0; i < studentIDs.length; i++){
		studentIDs[i] = classroom.students[i].userID;
	}

 	async.parallel({
 		submissions: function(callback){
			Submission
			.find({assignmentID: assignmentID, studentID: { $in : studentIDs }},
			{ studentID: 1, pointsEarned: 1 }, 
			function(err, submissions){
				callback(err, submissions);
			});
 		},
 		assignment: function(callback){
 			Assignment.findOne({_id: assignmentID}, { pointsWorth: 1 }, function(err, assignment){
 				callback(err, assignment);
 			});
 		}
 	}, function(err, results){
 		var assignment = results.assignment;
 		var submissions = results.submissions;

		if (err){
			return callback(err, null);
		}

		if (submissions.length === 0){
			return callback(new DescError('No submissions for that assignment.', 400), null);
		}

		if (!assignment){
			return callback(new DescError('That assignment does not exist', 400), null);
		}

		createGradesCSV(classroom, submissions, assignment, function(completedCSV){
			callback(null, completedCSV);
		});
 	});
}

var createGradesCSV = function(classroom, submissions, assignment, callback){

	//Actually create the csv.
	//Hash the results so we can quickly access them through the student ID
	//Use studentID to do an application level join to get gradebook id and grade together.
	//TODO: create a different kind of CSV for every different eletronic gradebook?

	var hash = {};
	var gradeInfo = new Array();

	for(var i = 0 ; i < submissions.length ; i++ ){
	    var item = submissions[i];
	    var id = item.studentID;
	    hash[ id ] = item;
	}

	for(var i = 0 ; i < classroom.students.length; i++ ){
		var newGrade = { gradebookID: classroom.students[i].gradebookID };

		if (typeof hash[classroom.students[i].userID] !== 'undefined'){
			var submission = hash[classroom.students[i].userID];

			newGrade.grade = (submission.pointsEarned / assignment.pointsWorth);
		}else{
			newGrade.grade = 0;
		}
		gradeInfo.push(newGrade);
	}

	csv.stringify(gradeInfo, function(err, completedCSV){
		callback(completedCSV);
	});
}
