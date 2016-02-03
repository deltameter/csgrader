'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var classroomSchema = new Schema({
		classroomName: { type: String, required: true },

		//use this to make API calls to teachers' online gradebooks
		gradebookProvider: String,
		gradebookID: String,

		//one teacher per classroom
		teacher: Schema.Types.ObjectId,
		students: [Schema.Types.ObjectId],
	});

	classroomSchema.path('classroomName').validate(function(classroomName){
		return validator.isAlpha(classroomName) && classroomName.length > 3 && classroomName.length <= 50;
	}, 'The course name must be between 3 and 50 characters long and contain only alphanumeric characters.');

	mongoose.model('Classroom', classroomSchema);
}