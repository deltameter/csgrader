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
	code: Schema.Types.Mixed,
	testCode: Schema.Types.Mixed,
	correctAnswer: String,
	triesAllowed: Number
});

exerciseSchema.pre('validate', function(next){
	if (this.code === null || typeof this.code !== 'object'){
		return next(Error('The code is not formatted in the proper way. Please delete this exercise and create it again'));
	}else if (typeof this.code.Main === 'undefined' || this.code.Main === null || this.code.Main.length < 0){
		return next(Error('A class/file entitled "Main" is required to run. Put your unit tests and such there.'));
	}

	return next();
});

exerciseSchema.pre('save', function(next){
	var exercise = this;

	//If it's not finished, check if it is now finished
	if (!exercise.bIsFinished){
		if (exercise.bIsTested && typeof exercise.context !== 'undefined'
		 && typeof exercise.pointsWorth !== 'undefined' && typeof exercise.triesAllowed !== 'undefined'){
			exercise.bIsFinished = true;
		}
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
