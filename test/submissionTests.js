var testTeacher = require('./assignmentTests').testTeacher,
	testStudent = require('./assignmentTests').testStudent,
	expect = require('chai').expect,
    async = require('async');

describe('Submission', function(){

	describe('submit question', function(){
		it('should accept a multiple choice answer', function(done){
			var answer = {
				questionNum: 1,
				answer: 3
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/submit/question')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		});

		it('should accept a fill in the blank answer', function(done){
			var answer = {
				questionNum: 0,
				answer: ' dank '
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/submit/question')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				expect(res.body.bIsCorrect).to.equal(true);
				done();
			});
		})

		it('should not accept the submission if the user has already gotten it right', function(done){
			var answer = {
				questionNum: 1,
				answer: 3
			}

			testStudent
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/submit/question')
			.send(answer)
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it ('should deny users after they\'ve tried too many times', function(done){
			var answer = {
				questionNum: 3,
				answer: 3
			}

			var test = function(callback){
				testStudent
				.put('/api/course/smushdapcs/assignment/' + assignment._id + '/submit/question')
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
		})
	});
});
//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;