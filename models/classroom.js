'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var classroomSchema = new Schema({
		name: { type: String, required: true },

		//use this to make API calls to teachers' online gradebooks
		gradebookProvider: String,
		gradebookID: String,

		//one teacher per classroom
		teacher: Schema.Types.ObjectId,
		students: [Schema.Types.ObjectId],
	});

	classroomSchema.path('name').validate(function(name){
		return validator.isAlpha(name) && name.length > 3 && name.length <= 50;
	}, 'The classroom name must be between 3 and 50 characters long and contain only alphanumeric characters.');

	mongoose.model('Classroom', classroomSchema);
}