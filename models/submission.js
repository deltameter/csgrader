'use strict';

module.exports = function(){
	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var submissionSchema = new Schema({
		student: { type: Schema.Types.Mixed, required: true },

		questionAnswers: [String],
		exerciseAnswers: [String],

		pointsEarned: { type: Number, default: 0 },
		questionsCorrect: [Number],
	});

	mongoose.model('Submission', submissionSchema);
}