'use strict';

var mongoose = require('mongoose'),
	validator = require('validator'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	languageHelper = require(__base + 'routes/libraries/languages'),
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

courseSchema.path('password').validate(function(password){
	return password.length >= 6 && password.length <= 20;
}, 'The course password must be between 6 and 20 characters long and contain only alphanumeric characters.');

courseSchema.path('classrooms').validate(function(classrooms){
	return classrooms.length <= 10;
}, 'You can only have up to 10 classrooms');

courseSchema.statics = {
	properties: {
		maxClassrooms: 10
	},
	
	create: function(teacher, courseInfo, callback){
		var Course = this;
		if (teacher.courses.length >= Course.properties.maxClassrooms + 30){
			return callback(new DescError('You already have the maximum amount of courses allowed.'), 400);
		}

		if (courseInfo.courseCode.length >= 15){
			return callback(new DescError('The Course Code is too long'));
		}

		var newCourse = new Course({
			owner: teacher._id,
			name: courseInfo.name,
			courseCode: courseInfo.courseCode.replace(/\s/g, ''),
			password: courseInfo.password,
			defaultLanguage: languageHelper.findByString(courseInfo.defaultLanguage).definition.langID
		});

		newCourse.save(function(err, course){
			if (err) return callback(err, null);

			return callback(null, course._id);
		});
	},

	get: function(courseCode, projection, callback){
		var Course = this;
		Course.findOne({ courseCode: courseCode }, projection, function(err, course){
			if (err){ return callback(err) }
			if (!course){ return callback(new DescError('That course was not found'), 400); }
			return callback(null, course);
		})
	},

	getByID: function(courseID, projection, callback){
		var Course = this;
		Course.findOne({ _id: courseID }, projection, function(err, course){
			if (err){ return callback(err) }
			if (!course){ return callback(new DescError('That course was not found'), 400); }
			return callback(null, course);
		})
	},

	getCourseList: function(courseIDs, projection, callback){
		var Course = this;
		Course.find({ _id : { $in : courseIDs }}, projection, function(err, courses){
			return callback(null, courses);
		})
	},

	getWithOpenAssignments: function(courseCode, projection, callback){
		var Course = this;
		const assignmentFilter = { bIsOpen: true };

		Course
		.findOne({ courseCode: courseCode })
		.select(projection)
		.populate('owner', 'firstName lastName')
		.populate('assignments', 'courseID name description', assignmentFilter)
		.exec(function(err, course){
			if (err) { return callback(err) }
			if (!course){ return callback(new DescError('That course was not found'), 400); }
			return callback(null, course);
		});
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
	},

	forkCourse: function(courseCode, teacher, courseInfo, callback){
		var objectIdDel = function(copiedObjectWithId) {
			if (copiedObjectWithId != null && typeof(copiedObjectWithId) !== 'string' &&
				typeof(copiedObjectWithId) !== 'number' && typeof(copiedObjectWithId) !== 'boolean' ){

				//for array length is defined however for objects length is undefined
				if (typeof(copiedObjectWithId.length) === 'undefined') { 
					delete copiedObjectWithId._id;
					for (var key in copiedObjectWithId) {
				        objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
				    }
				}
				else {
					for (var i = 0; i < copiedObjectWithId.length; i++) {
				        objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
				    }
				}
			}
		}

		
	}
}

courseSchema.methods = {
	edit: function(teacher, editInfo){
		var course = this;
		if (course.owner === teacher._id){
			for(var key in editInfo){
				course[key] = editInfo[key];
			}
		}else{
			return new DescError('Must be the course owner to do this.', 400);
		}
	},

	parseRegistrationCode: function(user, classCode, password){
		var course = this;

		if (course.password !== password){
			return new DescError('Invalid password', 400);
		}

		if (user.courses.indexOf(course._id) !== -1){
			return new DescError('Already enrolled', 400);
		}

		var classroom = course.classrooms.find(function(classroom){
			return classroom.classCode === classCode;
		})

		if (!classroom){
			return new DescError('Wrong registration code.', 400);
		}

		return classroom;
	},

	addAssignment: function(assignment){
		var course = this;
		course.assignments.push(assignment._id);
	},

	removeAssignment: function(assignmentID){
		var course = this;
		var aIndex = course.assignments.indexOf(assignmentID);
		course.assignments.splice(aIndex, 1);
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

	removeOpenAssignment: function(assignmentID){
		var course = this;
		var removeIndex = course.openAssignments.findIndex(x => x.assignmentID.toString() == assignmentID.toString())

		if (removeIndex === -1){
			return new DescError('Could not find assignment', 400);
		}

		course.openAssignments.splice(removeIndex, 1);
	},

	getClassroom: function(classCode){
		var course = this;
		const classIndex = course.classrooms.map(function(e) { return e.classCode; }).indexOf(classCode);

		return course.classrooms[classIndex];
	},

	getClassroomByUserID: function(userID){
		var course = this;

		var classroom = course.classrooms.find(function(classroom){ 
			return classroom.students
			.filter(function(student){
				return typeof student.userID !== 'undefined'
			})
			.map(function(student){ 
				return student.userID.toString()
			}).indexOf(userID.toString()) !== -1;
		})

		return classroom;
	},

	addClassroom: function(classroom){
		var course = this;
		course.classrooms.push(classroom);
	},

	deleteClassroom: function(classCode){
		var course = this;
		var classIndex = course.classrooms.map(function(e) { return e.classCode; }).indexOf(classCode);
		
		course.classrooms.splice(classIndex, 1);
	},

	/*
		@description: this just randomizes the courseCode. Used to "delete" courses.
					  so if a teacher removes a course with a courseCode "abc", they can make another with the same courseCode "abc"
	*/

	randomizeCourseCode: function(){
		var course = this;
		course.courseCode = course._id + require('crypto').randomBytes(2).toString('hex');
	}
}

mongoose.model('Course', courseSchema);