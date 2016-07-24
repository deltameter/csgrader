var testTeacher = require('./assignmentTests').testTeacher,
	testStudent = require('./assignmentTests').testStudent,
	exerciseIDs = require('./assignmentTests').exerciseIDs,
	questionIDs = require('./assignmentTests').questionIDs,
	expect = require('chai').expect,
    async = require('async');


describe('Submission', function(){
	describe('submit question', function(){
		it('should accept a fill in the blank answer', function(done){
			var answer = {
				questionID: questionIDs[0],
				answer: ' dank '
			}

			testStudent
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
			.send(answer)
			.end(function(err, res){
				console.log(res.body)
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept a multiple choice answer', function(done){
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

		it ('should deny users after they\'ve tried too many times', function(done){
			var answer = {
				questionID: questionIDs[2],
				answer: 3
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

	describe('submission tools', function(){
		it('should get an exported CSV of values', function(done){
			var info = {
				classIndex: 0,
				assignmentID: assignment._id
			}

			testTeacher
			.get('/api/course/MikeCS/classroom/' + classroom.classCode + 'grades/export')
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