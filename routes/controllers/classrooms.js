'use strict';

const mongoose = require('mongoose'),
	Classroom = mongoose.model('Classroom'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Student = mongoose.model('Student'),
	User = mongoose.model('User'),
	async = require('async'),
	config = require(__base + 'app/config'),
	csv = require('csv'),
	resources = require(__base + 'routes/libraries/resources'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getClassroom = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		req.session.classroom = resources.loadSpecificClass(course, req.params.classCode).classroom
		return helper.sendSuccess(res, req.session.classroom);
	});
}

module.exports.getClassrooms = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		return helper.sendSuccess(res, course.classrooms);
	});
}

module.exports.create = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){

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
			teacher: req.user._id,
			name: req.body.name,
			classCode: classCode
		});

		course.classrooms.push(newClassroom);

		course.save(function(err, course){
			if (err){ return helper.sendError(res, 400, 1001, helper.errorHelper(err)) };

			return helper.sendSuccess(res, newClassroom);
		});
	});
}

module.exports.deleteClassroom = function(req, res){
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		course.classrooms.splice(resources.loadSpecificClass(course, req.params.classCode).classroomIndex, 1);

		course.save(function(err){
			if(err){ return helper.sendError(res, 400, 1001, helper.errorHelper(err)) };
			return helper.sendSuccess(res);
		});
	});
}

module.exports.importStudents = function(req, res){
	//REQUIRES classroom.classCode, csv file
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		var classroom = resources.loadSpecificClass(course, req.params.classCode).classroom;

		var columnSelector = function(columns){
			for (var i = 0; i < columns.length; i++){
				//remove spaces and capitals
				columns[i] = columns[i].replace(/ /g,'').toLowerCase();
			}
			return columns;
		}

		csv.parse(req.file.buffer, { trim: true, columns: columnSelector }, function(err, students){
			for (var i = 0; i < students.length; i++){
				var newStudent = new Student({
					gradebookID: students[i].gradebookid,
					firstName: students[i].firstname,
					lastName: students[i].lastname
				});

				classroom.students.push(newStudent);
			}

			course.save(function(err, classroom){
				if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
				return helper.sendSuccess(res);
			});
		});
	});
}

module.exports.addStudent = function(req, res){
	//REQUIRES classroom._id, student.firstname, student.lastname, student.gradebook
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		var classroom = resources.loadSpecificClass(course, req.params.classCode).classroom;

		var newStudent = new Student({
			gradebookID: req.body.gradebookID,
			firstName: req.body.firstName,
			lastName: req.body.lastName
		});

		classroom.students.push(newStudent);


		course.save(function(err, course){
			if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
			return helper.sendSuccess(res, newStudent);
		});
	});
}

module.exports.editStudent = function(req, res){
	//REQUIRES classroom.student._id
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1}, function(err, course){
		var classroom = resources.loadSpecificClass(course, req.params.classCode).classroom;
		//IMPORTANT, this is the ID of the STUDENT model, not the USER model!!!
		const studentClassID = req.body.studentClassID;


		var studentIndex = -1;

		for (var i = 0; i < classroom.students.length; i++){
			if (classroom.students[i]._id.toString() === studentClassID){
				studentIndex = i;
				break;
			}
		}

		if (studentIndex === -1){
			return helper.sendError(res, 400, 300, 'That student was not found.');
		}

		classroom.students[studentIndex].gradebookID = req.body.gradebookID;
		classroom.students[studentIndex].firstName = req.body.firstName;
		classroom.students[studentIndex].lastName = req.body.lastName;

		course.save(function(err, classroom){
			if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
			return helper.sendSuccess(res);
		});
	});
}

module.exports.deleteStudent = function(req, res){
	//REQUIRES classroom.student._id
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		var classroom = resources.loadSpecificClass(course, req.params.classCode).classroom;
		//IMPORTANT, this is the ID of the STUDENT model, not the USER model!!!
		const studentClassID = req.params.studentClassID;
		var sI = -1;
		//use this to delete the course from the user
		var studentUserID;

		for (var i = 0; i < classroom.students.length; i++){
			if (classroom.students[i]._id.toString() === studentClassID){
				sI = i;
				break;
			}
		}

		if (sI === -1){
			return helper.sendError(res, 400, 3000, 'That student was not found.');
		}

		studentUserID = classroom.students[sI].userID;
		classroom.students.splice(sI, 1);

		course.save(function(err){
			if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));

			//remove course from student's courses array
			if (typeof studentUserID !== 'undefined'){
				User.findOne({ _id: studentUserID }, function(err, user){
					var courseIndex = user.courses.indexOf(course._id);
					user.courses.splice(courseIndex, 1);
					user.markModified('courses');
					user.save();
					
					return helper.sendSuccess(res);
				});
			}else{
				return helper.sendSuccess(res);
			}
		});
	});
}

module.exports.exportGrades = function(req, res){
	//requires assignment.ID
	Course.findOne({courseCode: req.params.courseCode}, { classrooms: 1 }, function(err, course){
		var classroom = resources.loadSpecificClass(course, req.params.classCode).classroom;

		var studentIDs = new Array(classroom.students.length);

		for(var i = 0; i < studentIDs.length; i++){
			studentIDs[i] = classroom.students[i].userID;
		}

	 	async.parallel({
	 		submissions: function(callback){
				Submission
				.find({assignmentID: req.body.assignmentID, studentID: { $in : studentIDs }},
				{ studentID: 1, pointsEarned: 1 }, 
				function(err, submissions){
					callback(err, submissions);
				});
	 		},
	 		assignment: function(callback){
	 			Assignment.findOne({_id: req.body.assignmentID}, { pointsWorth: 1 }, function(err, assignment){
	 				callback(err, assignment);
	 			});
	 		}
	 	}, function(err, results){
	 		var assignment = results.assignment;
	 		var submissions = results.submissions;

			if (err){
				console.log(err);
				return helper.sendError(res, 500, 1000, helper.errorHelper(err));
			}
			if (submissions.length === 0){
				return helper.sendError(res, 400, 3000, 'No submissions for that assignment yet.');
			}
			if (!assignment){
				return helper.sendError(res, 400, 3000, 'That assignment does not exist.');
			}


			createGradesCSV(classroom, submissions, assignment, function(completedCSV){
				helper.sendSuccess(res);
			});
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