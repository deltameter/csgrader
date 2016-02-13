var testTeacher = require('./courseTests').testTeacher,
	testStudent = require('./courseTests').testStudent,
	expect = require('chai').expect,
    async = require('async');

var mongoose = require('mongoose'),
	Submission = mongoose.model('Submission');

describe('Assignment', function(){
	var assignment = {};

	describe('creation', function(){
		it('should create an assignment given the right info', function(done){
			var newAssignment = {
				name: 'Hello World!',
				dueDate: new Date(2020, 11, 17),
				deadlineType: 'strict',
				pointsWorth: 20
			}

			testTeacher
			.post('/api/course/smushdapcs/assignment/create')
			.send(newAssignment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				assignment = res.body;
				done();
			});
		});
	});

	describe('edit', function(){
		it('should save new info about assignment', function(done){
			var edit = {
				name: 'Unit 1 Lab 1',
				description: 'dank memes'
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/edit')
			.send(edit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should open the assignment', function(done){
			var edit = {
				dueDate: new Date (2025, 1, 17),
				deadlineType: 'strict',
				pointsWorth: 69
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/open')
			.send(edit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});

	describe('question', function(){
		it('should create a fill in the blank question', function(done){
			var newQuestion = {
				question: 'Programming is ___',
				questionType: 'fillblank',
				bIsHomeWork: false,
				pointsWorth: 5,
				answerOptions: 'dank, memes'
			}

			testTeacher
			.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
			.send(newQuestion)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should create a multiple choice question', function(done){
			var newQuestion = {
				question: 'How dank are memes?',
				questionType: 'mc',
				bIsHomeWork: false,
				pointsWorth: 5,
				answerOptions: [
						'Extremely',
						'Quite',
						'Very',
						'Indubitibly' 
					],
				mcAnswer: 3
			}

			testTeacher
			.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
			.send(newQuestion)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});

	describe('retrieval', function(){
		it ('should respond', function(done){
			testStudent
			.get('/api/course/smushdapcs/assignment/' + assignment._id)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should create a new submission on first try', function(done){
			Submission.findOne({ assignmentID: assignment._id }, function(err, sub){
				expect(sub).to.exist;
				done();
			});
		});
	});
});

//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;