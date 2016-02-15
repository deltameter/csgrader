'use strict';

var mongoose = require('mongoose'),
	Classroom = mongoose.model('Classroom'),
	Assignment = mongoose.model('Assignment'),
	Submission = mongoose.model('Submission'),
	Student = mongoose.model('Student'),
	async = require('async'),
	config = require(__base + 'app/config'),
	csv = require('csv'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.create = function(req, res){
	var course = res.locals.course;

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
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));

		if (config.env === 'test'){
			return helper.sendSuccess(res, 
				{ classCode: newClassroom.classCode });
		}

		return helper.sendSuccess(res);
	});
}

module.exports.importUsersFromCSV = function(req, res){
	console.log(req.files);
}

module.exports.addStudent = function(req, res){
	//REQUIRES classroom._id, student.firstname, student.lastname, student.gradebook
	var course = res.locals.course;

	var classroom = course.classrooms.find(function(classroom){
		return classroom.classCode = req.body.classCode;
	});

	if (!classroom){
		return helper.sendError(res, 400, 300, 'That class was not found.');
	}

	var newStudent = new Student({
		gradebookID: req.body.gradebookID,
		firstName: req.body.firstName,
		lastName: req.body.lastName
	});

	classroom.students.push(newStudent);

	course.save(function(err, classroom){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		if (config.env === 'test'){
			return helper.sendSuccess(res, newStudent);
		}
		return helper.sendSuccess(res);
	});
}

module.exports.editStudent = function(req, res){
	//REQUIRES student._id
	var course = res.locals.course;

	var classroom = course.classrooms.find(function(classroom){
		return classroom.classCode = req.body.classCode;
	});

	if (!classroom){
		return helper.sendError(res, 400, 300, 'That class was not found.');
	}

	var studentIndex = -1;

	for (var i = 0; i < classroom.students.length; i++){
		if (classroom.students[i]._id.toString() === req.body.studentID){
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
}

module.exports.deleteStudent = function(req, res){
	//REQUIRES student._id
	var course = res.locals.course;

	var classroom = course.classrooms.find(function(classroom){
		return classroom.classCode = req.body.classCode;
	});

	if (!classroom){
		return helper.sendError(res, 400, 300, 'That class was not found.');
	}

	var studentIndex = -1;

	for (var i = 0; i < classroom.students.length; i++){
		if (classroom.students[i]._id.toString() === req.body.studentID){
			studentIndex = i;
			break;
		}
	}

	if (studentIndex === -1){
		return helper.sendError(res, 400, 300, 'That student was not found.');
	}

	classroom.students.splice(i, 1);

	course.save(function(err, classroom){
		if (err) return helper.sendError(res, 400, 1001, helper.errorHelper(err));
		return helper.sendSuccess(res);
	});
}

module.exports.exportGrades = function(req, res){
	//requires assignment.ID
	var time = Date.now();
	var course = res.locals.course;
	var cI = req.body.classIndex;

	var studentIDs = new Array(course.classrooms[cI].students.length);

	for(var i = 0; i < studentIDs.length; i++){
		studentIDs[i] = course.classrooms[cI].students[i].userID;
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


		createCSV(course.classrooms[cI], submissions, assignment, function(completedCSV){
			console.log(completedCSV);
			helper.sendSuccess(res);
		});
 	});
}

var createCSV = function(classroom, submissions, assignment, callback){

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