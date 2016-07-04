'use strict';

var mongoose = require('mongoose'),
	validator = require('validator'),
	Schema = mongoose.Schema,
	csv = require('csv'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

var classroomSchema = new Schema({
	name: { type: String, required: true },
	classCode: { type: String, required: true },
	//use this to make API calls to teachers' online gradebooks
	gradebookProvider: String,
	gradebookID: String,

	//one teacher per classroom
	teacher: { type: Schema.Types.ObjectId, required: true },
	students: [
		{
			userID: Schema.Types.ObjectId,
			gradebookID: { type: String, required: true },  
			firstName: { type: String, required: true },
			lastName: { type: String, required: true }
		}
	]
});

classroomSchema.path('name').validate(function(name){
	return name.length > 3 && name.length <= 50;
}, 'The classroom name must be between 3 and 50 characters long and contain only alphanumeric characters.');

classroomSchema.path('students').validate(function(students){
	return students.length <= 500;
}, 'You can have a maximum of 500 students in one class.');

classroomSchema.statics = {
	create: function(teacher, name, classrooms){
		var Classroom = this;

		var classCode = '';

		for (var a = 0; a < 100; a++){
			var bIsUnique = true;
			classCode = require('crypto').randomBytes(2).toString('hex');

			for (var i = 0; i < classrooms.length; i++){
				if (classrooms[i].classCode === classCode){
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
			name: name,
			classCode: classCode
		});

		return newClassroom;
	}
}

classroomSchema.methods = {
	addStudent: function(studentInfo){
		var classroom = this;

		var student = {
			firstName: studentInfo.firstName,
			lastName: studentInfo.lastName,
			gradebookID: studentInfo.gradebookID,
		}

		classroom.students.push(student);

		return classroom.students[classroom.students.length - 1]
	},

	addStudentsByCSV: function(csvFile, callback){
		var classroom = this;

		var columnSelector = function(columns){
			for (var i = 0; i < columns.length; i++){
				//remove spaces and capitals
				columns[i] = columns[i].replace(/ /g,'').toLowerCase();
			}
			return columns;
		}

		csv.parse(csvFile, { trim: true, columns: columnSelector }, function(err, students){
			if (err || students.length === 0){
				return callback(new DescError('No student records in that CSV.', 400));
			}

			if (typeof students[0].gradebookid === 'undefined'){
				return callback(new DescError('Please include a "Gradebook ID" column.', 400));
			}
			if (typeof students[0].firstname === 'undefined'){
				return callback(new DescError('Please include a "First Name" column.', 400));
			}
			if (typeof students[0].gradebookid === 'undefined'){
				return callback(new lastname('Please include a "Last Name" column.', 400));
			}

			for (var i = 0; i < students.length; i++){
				var studentInfo = {
					gradebookID: students[i].gradebookid,
					firstName: students[i].firstname,
					lastName: students[i].lastname
				}

				classroom.addStudent(studentInfo);
			}

			return callback(null);
		});
	},

	editStudent: function(studentID, studentInfo){
		var classroom = this;

		var studentIndex = classroom.students.map(function(e) { return e._id.toString(); }).indexOf(studentID);

		if (studentIndex === -1){ return new DescError('That student does not exist', 400) }

		classroom.students[studentIndex].gradebookID = studentInfo.gradebookID;
		classroom.students[studentIndex].firstName = studentInfo.firstName;
		classroom.students[studentIndex].lastName = studentInfo.lastName;
	},

	deleteStudent: function(studentID){
		var classroom = this;
		var studentIndex = classroom.students.map(function(e) { return e._id.toString(); }).indexOf(studentID);

		if (studentIndex === -1){ return new DescError('That student does not exist', 400) }

		var deleteUserID = classroom.students[studentIndex].userID;

		classroom.students.splice(studentIndex, 1);
		
		return deleteUserID;
	},

	exportGrades: function(assignment, submissions, callback){
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
			callback(err, completedCSV);
		});
	}
}

mongoose.model('Classroom', classroomSchema);
