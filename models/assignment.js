'use strict';

var mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	Exercise = mongoose.model('Exercise'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
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
	/*
		@description: takes an assignmentID and a projection and returns an assignment
		@param {MongoID} assignmentID: an object literal containing the changes the user wishes to make
		@param {Object Literal}: the fields the instigator wants
		@param {Function Pointer} callback
		@return (err, assignment)
	*/

	get: function(assignmentID, projection, callback){
		var Assignment = this;
		Assignment.findOne({ _id: assignmentID }, projection, function(err, assignment){
			if (err || !assignment){ return callback(new DescError('That assignment was not found', 400), null) };

			return callback(null, assignment);
		});
	},

	/*
		@description: aggregates a list of assignments for a certain course
		@param {Array of MongoIDs} assignments: the list of assignments to aggregate from
		@param {Object Literal} projection: the fields the instigator wants
		@param {Function Pointer} callback
		@return (err, assignments)
	*/

	getList:  function(assignments, projection, callback){
		var Assignment = this;
		Assignment.aggregate(
			{ $match: { _id: { $in : assignments } } },
			{ $project: projection },
			{ $sort: { name : 1 }},
			function(err, assignments){
				if (err){ return callback(new DescError('An error occured while searching for assignments.', 400), null) };
				return callback(null, assignments);
			}
		);
	},

	/*
		@description: searches for assignments in a course and returns a projection
		@param {Array of MongoIDs} assignments: the list of assignments to aggregate from
		@param {String} searchTerms: the keywords the user searched with
		@param {Number} searchLimit: how many assignments to return
		@param {Object Literal} projection: the fields the instigator wants
		@param {Function Pointer} callback
		@return (err, assignments)
	*/

	search: function(assignments, searchTerms, searchLimit, projection, callback){
		var Assignment = this;
		Assignment.aggregate(
			{ $match: { _id: { $in : assignments }, $text : { $search: searchTerms } } },
			{ $limit: searchLimit },
			{ $project: projection },
			{ $sort: { name : 1 } },
			function(err, assignments){
				if (err){ return callback(new DescError('An error occured while searching for assignments.', 400), null) };
				return callback(null, assignments);
			}
		);
	},

	/*
		@description: returns a new 
		@param {Course} course: the course this assignment belongs to
		@param {String} name: the name of the assignment
		@param {String} description: the description of the assignment
		@return newAssignment
	*/

	create: function(course, name, description){
		var Assignment = this;
		var newAssignment = new Assignment({
			courseID: course._id,
			courseCode: course.courseCode,
			name: name,
			description: description
		});

		return newAssignment;
	}



}

assignmentSchema.methods = {
	stripAnswers: function(assignment){
		var assignment = this;

		for (var i = 0; i < assignment.questions.length; i++){
			assignment.questions[i] = assignment.questions[i].stripAnswers();
		}

		for (var i = 0; i < assignment.exercises.length; i++){
			assignment.exercises[i] = assignment.exercises[i].stripAnswers();
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
	},

	/*
		@description: returns a new 
		@param {String} newName: self explanatory 
		@param {String} newDescription: self explanatory
	*/

	edit: function(newName, newDescription){
		var assignment = this;
		assignment.name = newName;
		assignment.description = newDescription;
	},

	open: function(dueDate, deadlineType, pointLoss, callback){
		var assignment = this;
	   	if (assignment.dueDate < Date.now()){
	       return callback(new DescError('Due date must be in the future', 400), null)
	    }

		var err = assignment.isContentIncomplete();
		if (err){ return callback(err, null) }

		assignment.bIsOpen = true;
		assignment.dueDate = dueDate;
		assignment.deadlineType = deadlineType.toLowerCase();
		assignment.pointLoss = pointLoss;
		assignment.pointsWorth = assignment.calculateTotalPoints();

		assignment.save(function(err, assignment){
			if (err){ return callback(err, null) };
			return callback(err, assignment);
		});
	},

	isContentIncomplete: function(){
		var assignment = this;
		var bIsComplete = true;

		bIsComplete = assignment.questions.every(function(question){
			return question.bIsFinished;
		});

		if (!bIsComplete){
			return new DescError('Not all questions are finished.', 400);
		}

		bIsComplete = assignment.exercises.every(function(question){
			return question.bIsFinished;
		});

		if (!bIsComplete){
			return new DescError('Not all exercises are finished.', 400);
		}

		return false;
	},

	calculateTotalPoints: function(){
		var assignment = this;
		var totalPoints = 0;

		assignment.exercises.forEach(function(exercise){
			totalPoints += exercise.pointsWorth;
		});

		assignment.questions.forEach(function(question){
			totalPoints += question.pointsWorth;
		});

		return totalPoints;
	},

	addContent: function(contentType, content){
		var assignment = this;

		assignment[contentType + 's'].push(content);
		assignment.contentOrder.push(contentType + content._id)
	},

	deleteContent: function(contentType, contentIndex, contentID){
		var assignment = this;
		assignment[contentType + 's'].splice(contentIndex, 1);

		//Splice it out of the content order
		var contentIndex = assignment.contentOrder.indexOf(contentType + contentID);
		assignment.contentOrder.splice(contentIndex, 1);

		assignment.markModified('contentOrder');
	},

	doesQuestionExist: function(questionIndex){
		return questionIndex < this.questions.length;
	},

	doesExerciseExist: function(exerciseIndex){
		return exerciseIndex < this.exercises.length;
	},

	isAssignmentOpen: function(){
		return this.bIsOpen;
	},

	isLocked: function(){
		if(!this.bIsOpen || (this.deadlineType === 'strict'  && this.dueDate < Date.now())){
			return new DescError('This assignment is currently locked', 400);
		}

		return false;
	}

}

assignmentSchema.path('pointLoss').validate(function(pointLoss){
	return pointLoss >= 0 && pointLoss <= 100;
}, 'Point loss % due to lateness must be between 0-100%.');

mongoose.model('Assignment', assignmentSchema);
