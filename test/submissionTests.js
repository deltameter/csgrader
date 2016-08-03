'use strict';

var testTeacher = require('./assignmentTests').testTeacher,
	testStudent = require('./assignmentTests').testStudent,
	exerciseIDs = require('./assignmentTests').exerciseIDs,
	questionIDs = require('./assignmentTests').questionIDs,
	assignment = require('./assignmentTests').assignment,
	expect = require('chai').expect,
    async = require('async');

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Submission = mongoose.model('Submission');

var submission = {};

describe('Submission', function(){
	describe('creation', function(){
		it ('should create a new submission and return the assignment on first access by student', function(done){
			testStudent
			.get('/api/course/MikeCS/assignment/' + assignment._id)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ assignmentID: assignment._id }, function(err, sub){
					expect(sub).to.exist;
					submission._id = sub._id;
					done();
				});
			});
		});

		it('should not create duplicate submissions', function(done){
			testStudent
			.get('/api/course/MikeCS/assignment/' + assignment._id)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.count({}, function(err, count){
					expect(count).to.equal(1);
					done();
				});
			});
		});

		it('should create a create a key to the newly created submission in the assignment', function(done){
			testTeacher
			.get('/api/course/MikeCS/assignment/' + assignment._id + '/submission')
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.length).to.equal(1);
				done();
			})
		})

	})
	describe('submit question', function(){
		it('shouldnt accept an incorrect fill in the blank answer', function(done){
			var answer = {
				questionID: questionIDs[0],
				answer: 'alksdfj'
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should accept a correct fill in the blank answer', function(done){
			var answer = {
				questionID: questionIDs[0],
				answer: ' dank '
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('shouldnt accept an incorrect multiple choice answer', function(done){
			var answer = {
				questionID: questionIDs[1],
				answer: 2
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should accept a correct multiple choice answer', function(done){
			var answer = {
				questionID: questionIDs[1],
				answer: 3
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it ('should deny users after they\'ve tried too many times', function(done){
			var answer = {
				questionID: questionIDs[2],
				answer: 2
			}

			var test = function(callback){
				testStudent
				.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
				.send(answer)
				.end(function(err, res){
					callback(err, { res: res, bIsCorrect: res.body.bIsCorrect });
				});
			}

			async.series([test, test, test, test], function(err, results){
				if (err) throw err;
				//expect the last one to throw an error
				expect(results[3].res.status).to.equal(400);
				done();
			});
		});

		it('should accept an frq answer that\'s homework', function(done){
			var answer = {
				questionID: questionIDs[3],
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept an frq answer that\'s not homework', function(done){
			var answer = {
				questionID: questionIDs[4],
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should not accept the submission if the user has already gotten it right', function(done){
			var answer = {
				questionID: questionIDs[1],
				answer: 3
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it('shouldn\'t accept an answer to a question that doesn\'t exist', function(done){
			var answer = {
				questionID: 'rarememes',
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.not.equal(200);
				done();
			});
		});
	});

	describe('exercise submission', function(){
		it('should save an exercise answer', function(done){
			var info = {
				exerciseIndex: 0,
				code: [
					{ 
						name: 'Kang.java',
						code: 'public class Kang{ public String speak(){ return "I AM UNCERTAIN AS TO THE STATUS OF OUR KANGNESS"; } }'
					}
				]
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/exercise/save')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should not accept an incorrect submission', function(done){
			//takes a while for the grading machine to get back to us
			this.timeout(5000);
			var info = {
				exerciseID: exerciseIDs[0],
				code: [
					{ 
						name: 'Kang.java',
						code: 'public class Kang{ public String speak(){ return "WE WUZ NOT KANGZ"; } }'
					}
				]
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/exercise/submit')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should not accept an submission that only passes one test', function(done){
			//takes a while for the grading machine to get back to us
			this.timeout(5000);
			var info = {
				exerciseID: exerciseIDs[0],
				code: [
					{ 
						name: 'Kang.java',
						code: 'public class Kang{ public String speak(){ return "WE WUZ KANGZ"; } }'
					}
				]
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/exercise/submit')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should accept a correct submission that satisfies multiple tests', function(done){
			//takes a while for the grading machine to get back to us
			this.timeout(5000);
			var info = {
				exerciseID: exerciseIDs[0],
				code: [
					{ 
						name: 'Kang.java',
						code: 'public class Kang{ public String speak(){ return "WE WUZ KANGZ"; } public String getHistory(){ return "WE WUZ EGYPTIANS AND SHIET"; } }'
					}
				],
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/exercise/submit')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should successfully rate limit users that try to submit too many times', function(done){
			this.timeout(20000);
			var info = {
				exerciseID: exerciseIDs[0],
				code: [
					{ 
						name: 'Kang.java',
						code: 'public class Kang{ public String speak(){ return "WE WUZ KANGZ"; } public String getHistory(){ return "WE WUZ EGYPTIANS AND SHIET"; } }'
					}
				],
			}

			var submit = function(callback){
				testStudent
				.put('/api/course/MikeCS/assignment/' + assignment._id + '/exercise/submit')
				.send(info)
				.end(function(err, res){
					return callback(res.status !== 200);
				});
			}

			var ddosAttempt = [];
			for (var i = 0; i < 10; i++){
				ddosAttempt.push(submit);
			}

			async.series(ddosAttempt, function(err){
				expect(err).to.equal(true);
				done();
			})
		})
	});

	describe('finished submission', function(){
		it ('should add up the points correctly', function(done){
			Submission.findOne({ _id: submission._id }, function(err, sub){
				expect(sub.pointsEarned).to.equal(25);
				done();
			});
		})

		it ('should display correct points earned for each individual content', function(done){
			Assignment.findOne({ _id: assignment._id}, { questions: 1 }, function(err, fullAssignment){
				Submission.findOne({ _id: submission._id }, function(err, sub){
					function findIndexOfQuestions(questionID){
						return fullAssignment.questions.findIndex(function(question){
							return questionID.toString() === question._id.toString();
						})
					}
					expect(sub.questionPoints[findIndexOfQuestions(questionIDs[0])]).to.equal(5);
					expect(sub.questionPoints[findIndexOfQuestions(questionIDs[1])]).to.equal(5);
					expect(sub.questionPoints[findIndexOfQuestions(questionIDs[2])]).to.equal(0); //tried too many times locked out
					expect(sub.questionPoints[findIndexOfQuestions(questionIDs[3])]).to.equal(5);
					expect(sub.questionPoints[findIndexOfQuestions(questionIDs[4])]).to.equal(0); //frq that's to be graded
					expect(sub.exercisePoints[0]).to.equal(10);
					done();
				});
			})
		})
	})
});

//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;
module.exports.exerciseIDs = exerciseIDs;
module.exports.questionIDs = questionIDs;
module.exports.assignment = assignment;
module.exports.submission = submission;