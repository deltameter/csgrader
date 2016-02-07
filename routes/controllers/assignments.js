'use strict';

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Question = mongoose.model('Question'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.showAssignment = function(req, res){
	res.locals.assignment = res.locals.course.assignments[aIndex];

	if (req.user.bIsTeacher){
		return res.render('pages/assignment/assignmentTeacher.ejs');
	}else{
		return res.render('pages/assignment/assignmentStudent.ejs');
	}
}

module.exports.create = function(req, res){
	var course = res.locals.course;
	var newAssignment = new Assignment({
		name: req.body.name
	});

	course.assignments.push(newAssignment);
	course.save(function(err){
		return res.redirect('/course/' + course.ID + '/assignment/' + (course.assignments.length - 1));
	});
}

module.exports.editContext = function(req, res){
	var course = res.locals.course;
	var aIndex = res.locals.aIndex;

	course.assignments[aIndex].description = req.body.description;
	course.save();
	return res.sendStatus(200);
}

module.exports.addQuestion = function(req, res){
	var answers;

	//Parse the answers
	if (req.body.questionType == 'open'){
		answers = req.body.answers.split(',');
		if (answers.length >= Question.properties.maxAnswers){
			return helper.sendError(res, 401, 'Must have less than 10 possible answers');
		}
		//Remove spaces to check for string comparisons easier
		for (var i = 0; i < answers.length; i++){
			answers[i] = answers[i].trim();
		}
	}else{
		//ensure data integrity. answers must be an array
		if (!Array.isArray(req.body.answers)){
			return helper.sendError(res, 401, 'Something went wrong with the multiple choice selection');
		}
	}

	var newQuestion = new Question({
		question: req.body.question,
		questionType: req.body.questionType,
		bIsHomework: req.body.bIsHomework,
		pointsWorth: req.body.pointsWorth,
		bCheckForOneAnswer: req.body.bCheckForOneAnswer,
		answers: answers
	});
}

module.exports.addExercise = function(req, res){
	
}