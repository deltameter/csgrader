'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		validator = require('validator'),
		Schema = mongoose.Schema;

	var courseSchema = new Schema({
		//Absolute owner of course. Holds Imperium. 
		owner: Schema.Types.ObjectId,
		courseName: { type: String, required: true },
		coursePassword: { type: String, required: true},

		//can possibly have multiple teacher teaching same course and want to share materials
		//can also have different classrooms for different periods
		classrooms: [mongoose.model('Classroom').schema],

		assignments: [mongoose.model('Assignment').schema]
	});

	courseSchema.path('courseName').validate(function(courseName){
		return courseName.length >= 5 && courseName.length <= 100;
	}, 'The course name must be between 5 and 100 characters long.');

	courseSchema.path('coursePassword').validate(function(coursePassword){
		return validator.isAlphanumeric(coursePassword) && coursePassword.length >= 6 && coursePassword.length <= 20;
	}, 'The course password must be between 6 and 20 characters long and contain only alphanumeric characters.');

	courseSchema.plugin(autoIncrement.plugin, { model: 'Course', field: 'courseID', startAt: 1 });
	mongoose.model('Course', courseSchema);
}