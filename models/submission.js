'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	DescError = require(__base + 'routes/libraries/errors').DescError;

var submissionSchema = new Schema({
	studentID: { type: Schema.Types.ObjectId, required: true },
	studentName: { type: String, required: true },
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
	get: function(assignmentID, userID, projection, callback){
		var Submission = this;
		Submission.findOne({ studentID: userID, assignmentID: assignmentID }, projection, function(err, submission){
			if (err) { return callback(err, null); }
			if (!submission) { return callback(new DescError('There is no submission for that user', 404), null); }
			return callback(null, submission);
		})
	},

	getBySubmissionIDs: function(submissionIDs, projection, callback){
		var Submission = this;
		Submission.find({ _id: { $in: submissionIDs }}, projection, function(err, submissions){
			if (err) { return callback(err, null); }
			if (!submissions) { return callback(new DescError('There are no submissions for those users', 404), null); }
			return callback(null, submissions);
		})
	},

	create: function(student, assignment, callback){
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
			studentID: student._id,
			studentName: student.firstName + ' ' + student.lastName,
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

		newSubmission.save(function(err, submission){
			return callback(err, submission);
		})
	},

	deleteByAssignment: function(assignment, callback){
		var Submission = this;

		Submission.remove({ assignmentID: assignment._id }, function(err, res){
			return callback(err, res);
		})
	}
}

submissionSchema.methods = {

	isExerciseLocked: function(exercise, exerciseIndex){
		var submission = this;

		if (typeof exercise === 'undefined'){
			return new DescError('Invalid exercise.', 400);
		}

		//-1 = unlimited
		if (exercise.triesAllowed !== -1 && submission.exerciseTries[exerciseIndex] >= exercise.triesAllowed){
			return new DescError('You can\'t try this exercise any more', 400);
		}

		return false;
	},

	isQuestionLocked: function(question, questionIndex){
		var submission = this;

		if (typeof question === 'undefined'){
			return new DescError('Invalid question.', 400);
		}

		if (submission.questionsCorrect[questionIndex]){
			return new DescError('You\'ve already gotten this question correct!', 400);
		}

		//-1 = unlimited tries
		if (question.triesAllowed !== -1 && submission.questionTries[questionIndex] >= question.triesAllowed){
			return new DescError('You can\'t try this question any more', 400);
		}

		return false;
	},

	recordQuestionAnswer: function(answer, questionIndex){
		var submission = this;

		submission.questionAnswers[questionIndex] = answer.toString();
		submission.questionTries[questionIndex]++;
		
		submission.markModified('questionAnswers');
		submission.markModified('questionTries');
	},

	recordExerciseAnswer: function(bIsSubmitting, code, exerciseIndex){
		var submission = this;

		submission.exerciseAnswers[exerciseIndex] = code;
		submission.markModified('exerciseAnswers');

		//if the user is just saving, don't increase their tries
		if (bIsSubmitting){
			submission.exerciseTries[exerciseIndex]++;
			submission.markModified('exerciseTries');
		}
	},

	rewardCorrectQuestion: function(assignment, questionIndex){
		var submission = this;

		var points = submission.addPoints(assignment, assignment.questions[questionIndex].pointsWorth);

		submission.questionPoints[questionIndex] = points;
		submission.questionsCorrect[questionIndex] = true;
		submission.markModified('questionPoints');
		submission.markModified('questionsCorrect');
	},

	rewardExerciseAnswer: function(assignment, exerciseIndex, bIsCorrect, pointsEarned){
		var submission = this;

		var points = submission.addPoints(assignment, pointsEarned);

		submission.exercisePoints[exerciseIndex] = points;
		submission.exercisesCorrect[exerciseIndex] = bIsCorrect;
		submission.markModified('exercisePoints');
		submission.markModified('exercisesCorrect');
	},

	addPoints: function(assignment, points){
		//remove points if it's late
		if (assignment.deadlineType === 'pointloss' && assignment.dueDate < Date.now()){
			points = points * (assignment.pointLoss / 100);
		}

		this.pointsEarned += points;
		return points;
	}
}

mongoose.model('Submission', submissionSchema);