'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var submissionSchema = new Schema({
	studentID: { type: Schema.Types.ObjectId, required: true },
	assignmentID: { type: Schema.Types.ObjectId, required: true },

	pointsEarned: { type: Number, default: 0 },

	questionAnswers: [String],
	questionTries: [Number],
	questionsCorrect: [Boolean],
	//teacher has to manually score these for frqs (or if bIsHomework, it get auto set to full points)
	questionPoints: [Number],

	exerciseAnswers: [Schema.Types.Mixed],
	exerciseTries: [Number],
	exercisesCorrect: [Boolean],
	//allow teachers to take off or add points to exercises
	exercisePoints: [Number],

	//Line num, class, and actual comment
	teacherComments: [Schema.Types.Mixed]
}, { minimize: false });
//set minimize: false or else empty exerciseAnswers are saved as null and that messes up the angular frontend

submissionSchema.index({ studentID: 1, assignmentID: 1 }, { unique: true });

submissionSchema.statics = {
	get: function(userID, assignmentID, projection, callback){
		Submission.findOne({ studentID: userID, assignmentID: assignmentID }, projection, function(err, submission){
			if (err) { return callback(err, null); }
			if (!submission) { return callback(new DescError('There is no submission for that user', 404), null); }
			return callback(null, submission);
		})
	},

	create: function(userID, assignment){
		var Submission = this;

		var questionAnswers = new Array(assignment.questions.length),
			questionTries = new Array(assignment.questions.length),
			questionsCorrect = new Array(assignment.questions.length),
			questionPoints = new Array(assignment.questions.length);

		var	exerciseAnswers = new Array(assignment.exercises.length),
			exerciseTries = new Array(assignment.exercises.length),
			exercisesCorrect = new Array(assignment.exercises.length),
			exercisePoints = new Array(assignment.exercises.length);

		for (var i = 0; i < assignment.questions.length; i++){
			questionAnswers[i] = '';
			questionTries[i] = 0;
			questionsCorrect[i] = false;
			questionPoints[i] = 0;
		}

		for (var i = 0; i < assignment.exercises.length; i++){
			exerciseAnswers[i] = assignment.exercises[i].code;

			//if the file is hidden, don't include when creating the submission
			for (var j = 0; j < exerciseAnswers.length; j++){
				if (exerciseAnswers[j].bIsHidden){
					exerciseAnswers.splice(j, 1);
					j--;
				}
			}

			exerciseTries[i] = 0;
			exercisesCorrect[i] = false;
			exercisePoints[i] = 0;
		}

		var newSubmission = new Submission({
			studentID: userID,
			assignmentID: assignment._id,
			questionAnswers: questionAnswers,
			questionTries: questionTries,
			questionsCorrect: questionsCorrect,
			questionPoints: questionPoints,
			exerciseAnswers: exerciseAnswers,
			exerciseTries: exerciseTries,
			exercisesCorrect: exercisesCorrect,
			exercisePoints: exercisePoints
		});

		return newSubmission;
	}
}

submissionSchema.methods = {
	recordExerciseAnswer: function(code, exerciseIndex){
		var submission = this;
		submission.exerciseAnswers[i] = code;
	}

}

mongoose.model('Submission', submissionSchema);