'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var exerciseSchema = new Schema({
	//the teacher must submit a finished submission of the exercise before releasing it
	bIsTested: { type: Boolean, default: false },
	language: { type: Number, required: true },
	title: { type: String, required: true },

	context: String,
	code: Schema.Types.Mixed,
	testCode: Schema.Types.Mixed,
	correctAnswer: String,
	triesAllowed: Number
});

exerciseSchema.pre('validate', function(next){
	console.log(this);
	if (this.code === null || typeof this.code !== 'object'){
		return next(Error('The code is not formatted in the proper way. Please delete this exercise and create it again'));
	}else if (typeof this.code.Main === 'undefined' || this.code.Main === null || this.code.Main.length < 0){
		return next(Error('A class/file entitled "Main" is required to run. Put your unit tests and such there.'));
	}

	return next();
});

mongoose.model('Exercise', exerciseSchema);
