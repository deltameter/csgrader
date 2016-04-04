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

mongoose.model('Submission', submissionSchema);