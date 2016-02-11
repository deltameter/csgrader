'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var submissionSchema = new Schema({
	studentID: Schema.Types.ObjectId,
	assignmentID: Schema.Types.ObjectId,

	questionAnswers: [String],
	exerciseAnswers: [String],

	pointsEarned: { type: Number, default: 0 },
	questionsCorrect: [Number],
});

submissionSchema.index({studentID: 1, assignmentID: 1}, {unique: true});

mongoose.model('Submission', submissionSchema);
