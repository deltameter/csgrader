'use strict';

module.exports = function(autoIncrement){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var assignmentSchema = new Schema({
		assignmentName: String,
		assignmentContent: String,
		
		questions: [mongoose.model('Question').schema],
		exercises: [mongoose.model('Exercise').schema]
	});

	mongoose.model('Assignment', assignmentSchema);
}