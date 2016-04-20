'use strict';

var mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	Exercise = mongoose.model('Exercise'),
	Schema = mongoose.Schema;

const deadlineTypes = 'strict pointloss lenient'.split(' ');

function contentValidator(val){
	return (val.indexOf('exercise') === 0 || val.indexOf('question') === 0);
}
const contentValidation = [contentValidator, '{PATH} must be exercise or question'];

var assignmentSchema = new Schema({
	courseID: { type: Schema.Types.ObjectId, required: true },
	courseCode: { type: String, required: true, index: true },
	
	//whether the assignment is up and viewable
	bIsOpen: { type: Boolean, default: false },
	name: { type: String, required: true, index: 'text' },
	description: String,

	deadlineType: { type: String, enum: deadlineTypes },
	dueDate: Date,

	pointsWorth: Number,

	//% of points lost due to lateness
	pointLoss: Number,

	questions: [mongoose.model('Question').schema],
	exercises: [mongoose.model('Exercise').schema],

	//Basically decides the order the questions and exercises go in.
	//false = question, true = exercise
	//allows a way to interweave questions and exercises
	contentOrder: [{ type: String, validate: contentValidation }],

	studentSubmissions: [Schema.Types.ObjectId]
});

assignmentSchema.statics = {
	safeSendStudent: function(assignment){
		for (var i = 0; i < assignment.questions.length; i++){
			assignment.questions[i] = Question.safeSendStudent(assignment.questions[i]);
		}

		for (var i = 0; i < assignment.exercises.length; i++){
			assignment.exercises[i] = Exercise.safeSendStudent(assignment.exercises[i]);
		}

		return {
			_id: assignment._id,
			name: assignment.name,
			description: assignment.description,
			dueDate: assignment.dueDate,
			pointsWorth: assignment.pointsWorth,
			pointLoss: assignment.pointLoss,
			questions: assignment.questions,
			exercises: assignment.exercises,
			contentOrder: assignment.contentOrder
		}
	}
}

assignmentSchema.path('pointLoss').validate(function(pointLoss){
	return pointLoss >= 0 && pointLoss <= 100;
}, 'Point loss % due to lateness must be between 0-100%.');

mongoose.model('Assignment', assignmentSchema);
