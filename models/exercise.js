'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config = require(__base + 'app/config'),
	httpClient = require('request'),
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
			code: String,
			bIsHidden: { default: false }
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
	},

	/*
		@description: takes an object literal and set's the exercise's keys equal to it's keys
		@param {Object Literal} language: an object containing config info for the language. found in languagehelper.js
		@param {String} title: the title of the exercise
	*/

	create: function(language, title){
		var newExercise = new this({
			title: title,
			language: language.definition
		});
		return newExercise;
	}
}

exerciseSchema.methods = {
	/*
		@description: takes an object literal and set's the exercise's keys equal to it's keys
		@param {Object Literal} editInfo: an object literal containing the changes the user wishes to make
	*/

	edit: function(editInfo){
		var exercise = this;

		for(var key in editInfo){
			exercise[key] = editInfo[key];
		}
	},

	/*
		@description: checks whether or not the exercise is finished. NOTE: this does not save the exercise. call assignment.save() after this
		@return (bIsFinished): returns whether or not exercise is finished
	*/

	isFinished: function(){
		var exercise = this;

		if (exercise.bIsFinished){
			return true;
		}

		//If it's not finished, check if it is now finished
		if (exercise.tests.length > 0 && typeof exercise.context !== 'undefined'
		 && typeof exercise.pointsWorth !== 'undefined' && typeof exercise.triesAllowed !== 'undefined'){
			var bTestsComplete = true;

			for (var i = 0; i < exercise.tests.length; i++){
				if (typeof exercise.tests[i].description === 'undefined' || typeof exercise.tests[i].pointsWorth !== 'number'){
					bTestsComplete = false;
					break;
				}
			}

			exercise.bIsFinished = bTestsComplete;
			return bTestsComplete;
		}

		return false;
	},

	/*
		@description: runs tests and related code on a sandbox microservice and returns results
		@param {this} exercise: the id of the language the code/tests are in. look in languagehelper for a list
		@param {Array of Object Literals}: the code being tested
		@param {Array of Object Literals}: the tests being run
		@return (err, result): whether or not the solution passed, a list of tests descriptions along with their status, and errors
	*/

	runTests: function(code, callback){
		var exercise = this;
		var options = {
			uri: config.gradingMachineURL + '/compile',
			method: 'POST',
			json: {
				language: exercise.language.langID,
				code: code,
				tests: exercise.tests
			}
		};

		httpClient(options, function(err, httpRes, compilationInfo){
			if (err){
				return callback(new DescError('Could not connect to the server. Please try again.', 500), null);
			}

			var bIsCorrect = compilationInfo.errors.length === 0;
			var passedTests = compilationInfo.passedTests.trim().split(' ');
			var fullTests = passedTests.concat(compilationInfo.failedTests.trim().split(' '));
			var testsWithDescriptions = [];

			for (var i = 0; i < fullTests.length; i++){
				var test = exercise.tests.find(function(test){
					return test.name === fullTests[i];
				})

				if (test){
					testsWithDescriptions.push({
						passed: (passedTests.indexOf(test.name) !== -1),
						description: test.description
					})
				}
			}

			return callback(null, { 
				bIsCorrect: bIsCorrect, 
				errors: compilationInfo.errors, 
				testResults: testsWithDescriptions }
			);
		});
	},

	/*
		@description: saves the teacher's code and whether or not it's correct
		@param {Array of Object Literals} bIsCorrect: whether or not the function is correct
		@param {Array of Object Literals} solutionCode: the teacher's solution
	*/

	saveTeacherSolution: function(bIsCorrect, solutionCode){
		var exercise = this;
		exercise.bIsTested = bIsCorrect;
		exercise.solutionCode = solutionCode;
	}
}

mongoose.model('Exercise', exerciseSchema);
