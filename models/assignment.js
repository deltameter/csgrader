'use strict';

var mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	Schema = mongoose.Schema;

const deadlineTypes = 'strict pointloss lenient'.split(' ');
const contentTypes = 'question exercise'.split(' ');

var assignmentSchema = new Schema({
	courseID: { type: Schema.Types.ObjectId, required: true },
	//whether the assignment is up and viewable
	bIsOpen: { type: Boolean, default: false },
	name: { type: String, required: true},
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
	contentOrder: [{ type: String, enum: contentTypes }],

	studentSubmissions: [Schema.Types.ObjectId]
});

assignmentSchema.statics = {
	safeSendStudent: function(assignment){
		for (var i = 0; i < assignment.questions.length; i++){
			assignment.questions[i] = Question.safeSendStudent(assignment.questions[i]);
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

assignmentSchema.pre('validate', function(next) {
	//If the assignment is being opened, it must contain a due date
    if (this.bIsOpen && (typeof this.dueDate === 'undefined' || this.dueDate < Date.now())){
        return next(Error('Due date must be in the future.'));
    //Ensure content order and questions + exercises count add up
    }else if (this.contentOrder.length !== this.questions.length + this.exercises.length){
        return next(Error('Amount of points lost due to tardiness must be less than total points.'));
    }else{
    	return next();
    }
});

assignmentSchema.path('pointLoss').validate(function(pointLoss){
	return pointLoss >= 0 && pointLoss <= 100;
}, 'Point loss % due to lateness must be between 0-100%.');

mongoose.model('Assignment', assignmentSchema);
