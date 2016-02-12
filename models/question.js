'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var questionTypes = 'frq fillblank mc'.split(' ');

var questionSchema = new Schema({
	question: { type: String, required: true },
	questionType: { type: String, enum: questionTypes, required: true },
	pointsWorth: { type: Number, required: true },

	bIsHomework: { type: Boolean, default: false }, //automatically grade as correct

	//For MC, this is a list of possible answers.
	//For fill in the blank, this is a list of acceptable answers
	answerOptions: [String],
	mcAnswer: Number
});

mongoose.model('Question', questionSchema);
