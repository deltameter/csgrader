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

	classSubmissions: [{
		className: { type: String, required: true },
		classCode: { type: String, required: true },
		submissionIDs: [Schema.Types.ObjectId]
	}]
});

assignmentSchema.statics = {
	clone: function(assignmentID, courseID, courseCode, callback){
		var Assignment = this;

		Assignment.get(assignmentID, {}, function(err, assignment){
			var cloneOfAssignment = JSON.parse(JSON.stringify(assignment));

			cloneOfAssignment._id = undefined;
			cloneOfAssignment.courseID = courseID;
			cloneOfAssignment.courseCode = courseCode;
			cloneOfAssignment.dueDate = undefined;
			cloneOfAssignment.deadlineType = undefined;
			cloneOfAssignment.classSubmissions = [];
			cloneOfAssignment.bIsOpen = false;

			cloneOfAssignment = Assignment.hydrate(cloneOfAssignment);

			cloneOfAssignment.save(function(err, clone){
				return callback(err, clone);
			})
		})
	},

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
	addSubmission: function(classroom, submission){
		var assignment = this;

		var classSubmission = assignment.classSubmissions.find(function(classSub){ 
			return classSub.classCode === classroom.classCode;
		})
		if (typeof classSubmission === 'undefined'){
			//not yet created, first submission!
			classSubmission = {
				className: classroom.name,
				classCode: classroom.classCode,
				submissionIDs: new Array()
			}

			classSubmission.submissionIDs.push(submission._id);
			assignment.classSubmissions.push(classSubmission)
		}else{
			classSubmission.submissionIDs.push(submission._id);
		}
	},

	stripAnswers: function(assignment){
		var assignment = this;

		var questions = new Array(assignment.questions.length);
		for (var i = 0; i < assignment.questions.length; i++){
			questions[i] = assignment.questions[i].stripAnswers();
		}

		var exercises = new Array(assignment.exercises.length);
		for (var i = 0; i < assignment.exercises.length; i++){
			exercises[i] = assignment.exercises[i].stripAnswers();
		}

		return {
			_id: assignment._id,
			name: assignment.name,
			description: assignment.description,
			dueDate: assignment.dueDate,
			pointsWorth: assignment.pointsWorth,
			pointLoss: assignment.pointLoss,
			questions: questions,
			exercises: exercises,
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

	   	if (dueDate < Date.now()){
	       return callback(new DescError('Due date must be in the future', 400), null)
	    }

	    if (assignment.bIsOpen){
	    	return callback(new DescError('This assignment is already open.', 400), null)
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

	close: function(){
		this.bIsOpen = false;
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

	getContentIndex: function(contentType, contentID){
		var assignment = this;

		const contentIndex = assignment[contentType + 's'].findIndex(function(content){
			return content._id.toString() === contentID.toString();
		});

		return contentIndex;
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
