'use strict';

module.exports = function(){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var assignmentSchema = new Schema({
		//whether the assignment is up and viewable
		bIsOpen: { type: Boolean, default: false },
		name: { type: String, required: true},
		description: String,
		
		pointsWorth: Number,
		questions: [mongoose.model('Question').schema],
		exercises: [mongoose.model('Exercise').schema],

		studentSubmissions: [mongoose.model('Submission')]
	});

	mongoose.model('Assignment', assignmentSchema);
}