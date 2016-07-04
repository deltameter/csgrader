'use strict';

var mongoose = require('mongoose'),
	validator = require('validator'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	Schema = mongoose.Schema;

var courseSchema = new Schema({
	//Absolute owner of course. Holds Imperium. 
	bIsOpen: { type: Boolean, default: false },
	owner: { type: Schema.Types.ObjectId, ref: 'User' },
	name: { type: String, required: true },

	courseCode: { type: String, required: true, index: true, unique: true },
	password: { type: String, required: true},

	defaultLanguage: { type: Number, required: true },
	//can possibly have multiple teacher teaching same course and want to share materials
	//can also have different classrooms for different periods
	classrooms: [mongoose.model('Classroom').schema],

	assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],

	openAssignments: [
		{
			assignmentID: { type: Schema.Types.ObjectId, required: true },
			name: { type: String, required: true },
			pointsWorth: { type: Number, required: true},
			dueDate: { type: Date, required: true }
		}
	]
});

courseSchema.path('name').validate(function(name){
	return name.length >= 5 && name.length <= 100;
}, 'The course name must be between 5 and 100 characters long.');

courseSchema.path('courseCode').validate(function(courseCode){
	return courseCode.length >= 1 && courseCode.length <= 10;
}, 'The course code must be between 1 and 10 characters and be unique.');

courseSchema.path('password').validate(function(password){
	return password.length >= 6 && password.length <= 20;
}, 'The course password must be between 6 and 20 characters long and contain only alphanumeric characters.');

courseSchema.path('classrooms').validate(function(classrooms){
	return classrooms.length <= 10;
}, 'You can only have up to 10 classrooms');

courseSchema.statics = {
	maxClassrooms: 10,

	get: function(courseCode, projection, callback){
		var Course = this;
		Course.findOne({ courseCode: courseCode }, projection, function(err, course){
			if (err){ return callback(err) }
			if (!course){ return callback(new DescError('That course was not found'), 400); }
			return callback(null, course);
		})
	},

	getWithClassroom: function(courseCode, classCode, projection, callback){
		var Course = this;
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
	},

	getClassroomsList: function(courseCode, projection, callback){
		var Course = this;
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
}

courseSchema.methods = {
	addAssignment: function(assignment){
		var course = this;
		course.assignments.push(assignment._id);
	},

	addOpenAssignment: function(assignment){
		var course = this;
		var openAssignment = {
			assignmentID: assignment._id,
			name: assignment.name,
			pointsWorth: assignment.pointsWorth,
			dueDate: assignment.dueDate
		}

		course.openAssignments.push(openAssignment);
	},

	deleteAssignment: function(assignmentID){
		var course = this;
		var aIndex = course.assignments.indexOf(assignmentID);
		course.assignments.splice(aIndex, 1);
	},

	addClassroom: function(classroom){
		var course = this;
		course.classrooms.push(classroom);
	},

	deleteClassroom: function(classCode){
		var course = this;
		var classIndex = course.classrooms.map(function(e) { return e.classCode; }).indexOf(classCode);
		
		course.classrooms.splice(classIndex, 1);
	}
}

mongoose.model('Course', courseSchema);