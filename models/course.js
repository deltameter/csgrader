'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var courseSchema = new Schema({
		courseName: { type: String, required: true },
		coursePassword: { type: String, required: true},

		//can possibly have multiple teacher teaching same course and want to share materials
		//can also have different classrooms for different periods
		classrooms: [mongoose.model('Classroom').schema],

		assignments: [mongoose.model('Assignment').schema]
	});

	courseSchema.path('courseName').validate(function(courseName){
		return validator.isAlpha(courseName) && courseName.length > 5 && courseName.length <= 100;
	}, 'The course name must be between 5 and 100 characters long and contain only alphanumeric characters.');

	courseSchema.path('coursePassword').validate(function(coursePassword){
		return validator.isAlpha(coursePassword) && coursePassword.length > 0 && coursePassword.length <= 25;
	}, 'The course password must be between 6 and 20 characters long and contain only alphanumeric characters.');


	courseSchema.plugin(autoIncrement.plugin, { model: 'Course', field: 'courseID', startAt: 1 });
	mongoose.model('Course', courseSchema);
}