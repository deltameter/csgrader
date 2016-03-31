var testTeacher = require('./assignmentTests').testTeacher,
	testStudent = require('./assignmentTests').testStudent,
	expect = require('chai').expect,
    async = require('async');

describe('Submission', function(){
	describe('submit question', function(){
		it('should accept a fill in the blank answer', function(done){
			var answer = {
				questionIndex: 0,
				answer: ' dank '
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept a multiple choice answer', function(done){
			var answer = {
				questionIndex: 1,
				answer: 3
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept an frq answer that\'s homework', function(done){
			var answer = {
				questionIndex: 3,
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept an frq answer that\'s not homework', function(done){
			var answer = {
				questionIndex: 4,
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(false);
				done();
			});
		});

		it('should not accept the submission if the user has already gotten it right', function(done){
			var answer = {
				questionIndex: 1,
				answer: 3
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it ('should deny users after they\'ve tried too many times', function(done){
			var answer = {
				questionIndex: 2,
				answer: 3
			}

			var test = function(callback){
				testStudent
				.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
				.send(answer)
				.end(function(err, res){
					callback(err, { res: res, bIsCorrect: res.body.bIsCorrect });
				});
			}

			async.series([test, test, test, test], function(err, results){
				if (err) throw err;
				//expect the last one to throw an error
				expect(results[3].res.status).to.equal(400);
				expect(results[3].res.body.errorCode).to.equal(3000);
				done();
			});
		});

		it('shouldn\'t accept an answer to a question that doesn\'t exist', function(done){
			var answer = {
				questionIndex: 100,
				answer: 'Implying implications'
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(404);
				done();
			});
		});
	});

	describe('exercise submission', function(){

		it('should not accept an incorrect submission', function(done){
			//takes a while for the grading machine to get back to us
			this.timeout(5000);
			var info = {
				exerciseIndex: 0,
				//hello world in java
				code: {
					Kang: 'public class Kang{ public String speak(){ return "WE WUZ NOT KANGZ"; } }'
				}
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/exercise/submit')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.errors).to.not.equal('');
				done();
			});
		});

		it('should save an exercise answer', function(done){

			var info = {
				exerciseIndex: 0,
				//hello world in java
				code: {
					Kang: 'public class Kang{ public String speak(){ return "I AM UNCERTAIN AS TO THE STATUS OF OUR KANGNESS"; } }'
				}
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/exercise/save')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should accept a correct submission', function(done){
			//takes a while for the grading machine to get back to us
			this.timeout(5000);
			var info = {
				exerciseIndex: 0,
				//hello world in java
				code: {
					Kang: 'public class Kang{ public String speak(){ return "WE WUZ KANGZ"; } }'
				}
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/exercise/submit')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.errors).to.equal('');
				done();
			});
		});
	});

	describe('submission tools', function(){
		it('should get an exported CSV of values', function(done){
			var info = {
				classIndex: 0,
				assignmentID: assignment._id
			}

			testTeacher
			.get('/api/course/smushdapcs/classroom/' + classroom.classCode + 'grades/export')
			.send(info)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});
});
//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;