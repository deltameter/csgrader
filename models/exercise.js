'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	languageHelper = require(__base + 'routes/libraries/languages');

var exerciseSchema = new Schema({
	//the teacher must submit a finished submission of the exercise before releasing it
	bIsFinished: { type: Boolean, default: false },
	bIsTested: { type: Boolean, default: false },
	language: { type: Schema.Types.Mixed, required: true },
	title: { type: String, required: true },
	pointsWorth: Number,

	context: String,

	//should contain objects where key is name of class and value is code
	code: [
		{
			name: String,
			code: String
		}
	],

	//the teacher's solution to the exercise
	solutionCode: [
		{
			name: String,
			code: String
		}
	],

	//should contain other object that contains points, description, code
	tests: [
		{
			name: String,
			pointsWorth: Number,
			description: String,
			code: String
		}
	],

	triesAllowed: Number

}, { minimize: false });

exerciseSchema.pre('validate', function(next){
	if (this.code === null || typeof this.code !== 'object'){
		return next(Error('The code is not formatted in the proper way. Please delete this exercise and create it again'));
	}

	return next();
});

exerciseSchema.statics = {
	safeSendStudent: function(exercise){
		delete exercise.code[languageHelper.testFileName];

		return {
			title: exercise.title,
			context: exercise.context,
			language: {
				langauge: exercise.language.langauge, 
				fileExt: exercise.language.fileExt
			},
			pointsWorth: exercise.pointsWorth,
			code: exercise.code,
			triesAllowed: exercise.triesAllowed
		}
	}
}

mongoose.model('Exercise', exerciseSchema);
