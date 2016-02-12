'use strict';

var mongoose = require('mongoose'),
	validator = require('validator'),
	Schema = mongoose.Schema;

var courseSchema = new Schema({
	//Absolute owner of course. Holds Imperium. 
	bIsOpen: { type: Boolean, default: false },
	owner: Schema.Types.ObjectId,
	name: { type: String, required: true },

	courseCode: { type: String, required: true, index: true },
	password: { type: String, required: true},

	//can possibly have multiple teacher teaching same course and want to share materials
	//can also have different classrooms for different periods
	classrooms: [mongoose.model('Classroom').schema],

	assignments: [Schema.Types.ObjectId],
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
	maxClassrooms: 10
}

mongoose.model('Course', courseSchema);