'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var submissionSchema = new Schema({
	studentID: { type: Schema.Types.ObjectId, required: true },
	assignmentID: { type: Schema.Types.ObjectId, required: true },

	questionAnswers: [String],
	exerciseAnswers: [String],

	pointsEarned: { type: Number, default: 0 },

	questionTries: [Number],
	questionsCorrect: [Boolean],

	exerciseTries: [Number],
	exercisesCorrect: [Boolean],

	//Line num, class, and actual comment
	teacherComments: [Schema.Types.Mixed]
});

submissionSchema.index({ studentID: 1, assignmentID: 1 }, { unique: true });

mongoose.model('Submission', submissionSchema);