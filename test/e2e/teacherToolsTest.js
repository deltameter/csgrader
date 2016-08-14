var testTeacher = require('./submissionTests').testTeacher,
	secondTeacher = require('./userTests').secondTeacher,
	teachingAssistant = require('./userTests').teachingAssistant,
	testStudent = require('./submissionTests').testStudent,
	exerciseIDs = require('./submissionTests').exerciseIDs,
	questionIDs = require('./submissionTests').questionIDs,
	assignment = require('./submissionTests').assignment,
	submission = require('./submissionTests').submission,
	expect = require('chai').expect,
    async = require('async');

var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	Submission = mongoose.model('Submission');

describe('teacher tools', function(){

	describe('course forking', function(){
		it('should fork a new course', function(done){
			var forkInfo = {
				courseCodeToFork: 'MikeCS',
				courseCode: 'MikeCSFork',
				name: 'New Mike CS',
				password: '1235678'
			}

			testTeacher
			.post('/api/course/fork')
			.send(forkInfo)
			.end(function(err, res){
				expect(res.status).to.equal(200);

				//make sure the assignments are properly forked
				async.parallel({
					assignment: function(callback){
						Assignment.findOne({ courseCode: 'MikeCS' }).lean().exec(function(err, assignment){
							return callback(err, assignment);
						})
					},
					forkedAssignment: function(callback){
						Assignment.findOne({ courseCode: 'MikeCSFork'}).lean().exec(function(err, assignment){
							return callback(err, assignment);
						})
					}
				}, function(err, results){
					expect(err).to.equal(null)

					const assignment = results.assignment;
					const forkedAssignment = results.forkedAssignment;

					//make sure all the questions and exercises are in the same order
					for (var i = 0; i < assignment.contentOrder.length; i++){
						expect(assignment.contentOrder[i]).to.equal(forkedAssignment.contentOrder[i])
					}

					function testArrayEquality(firstArray, secondArray){
						for (var i = 0; i < firstArray.length; i++){
							for (prop in firstArray[i]){
								expect(firstArray[i][prop]).to.deep.equal(secondArray[i][prop]);
							}
						}
					}

					testArrayEquality(assignment.questions, forkedAssignment.questions)
					testArrayEquality(assignment.exercises, forkedAssignment.exercises)

					done()
				})
			});
		})
	});

	describe('course collaboration', function(){
		var inviteCode = '';

		it('should generate an invite key for teachers', function(done){
			testTeacher
			.put('/api/course/MikeCS/invite')
			.end(function(err, res){
				expect(res.status).to.equal(200)
				expect(res.body.inviteCode.length).to.equal(8)
				inviteCode = res.body.inviteCode;
				done()
			})
		})

		it('shouldnt allow a student to use the teacher invite key', function(done){
			testStudent
			.put('/api/course/MikeCS/invite/' + inviteCode)
			.end(function(err, res){
				expect(res.status).to.equal(401);
				done()
			})
		})

		it('it should allow another teacher to use the invite code', function(done){
			secondTeacher
			.put('/api/course/MikeCS/invite/' + inviteCode)
			.end(function(err, res){
				expect(res.status).to.equal(200);

				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					expect(course.teachers.length).to.equal(2);
					done()
				})
			})
		})

		it('it should allow a teaching assistant to use the invite code', function(done){
			teachingAssistant
			.put('/api/course/MikeCS/invite/' + inviteCode)
			.end(function(err, res){
				expect(res.status).to.equal(200);

				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					expect(course.aides.length).to.equal(1);
					done()
				})
			})
		})

		it('it shouldnt allow a user to join the same course twice', function(done){
			secondTeacher
			.put('/api/course/MikeCS/invite/' + inviteCode)
			.end(function(err, res){
				expect(res.status).to.equal(400);

				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					expect(course.teachers.length).to.equal(2);
					done()
				})
			})
		})
	})

	describe('submission tools', function(){
		it('should let owner leave a comment on an exercise', function(done){
			var comment = {
				contentType: 'exercise',
				contentID: exerciseIDs[0],
				text: 'These memes are quite spicy!'
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(1);
					done();
				});
			});
		});

		it('should let other teacher leave a comment on an exercise', function(done){
			var comment = {
				contentType: 'exercise',
				contentID: exerciseIDs[0],
				text: 'These memes are quite spicy1!'
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(1);
					done();
				});
			});
		});

		it('should let teaching assistant leave a comment on an exercise', function(done){
			var comment = {
				contentType: 'exercise',
				contentID: exerciseIDs[0],
				text: 'These memes are quite spicy2!'
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(1);
					done();
				});
			});
		});

		it('should let owner grade an exercise', function(done){
			var grade = {
				contentType: 'exercise',
				contentIndex: 0,
				points: 5
			}

			teachingAssistant
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(20);
					expect(sub.exercisePoints[0]).to.equal(5);
					done();
				});
			});
		});

		it('should let other teacher grade an exercise', function(done){
			var grade = {
				contentType: 'exercise',
				contentIndex: 0,
				points: 7
			}

			teachingAssistant
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(22);
					expect(sub.exercisePoints[0]).to.equal(7);
					done();
				});
			});
		});

		it('should let a teaching assistant grade an exercise', function(done){
			var grade = {
				contentType: 'exercise',
				contentIndex: 0,
				points: 10
			}

			teachingAssistant
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(25);
					expect(sub.exercisePoints[0]).to.equal(10);
					done();
				});
			});
		});

		it('should let owner leave a comment on an frq', function(done){
			var comment = {
				contentType: 'question',
				contentID: questionIDs[4],
				text: 'U write goodly'
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(2);
					done();
				});
			});
		});

		it('should let other teacher leave a comment on an frq', function(done){
			var comment = {
				contentType: 'question',
				contentID: questionIDs[4],
				text: 'U write pretty goodly'
			}

			secondTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(2);
					done();
				});
			});
		});

		it('should let teaching assistant leave a comment on an frq', function(done){
			var comment = {
				contentType: 'question',
				contentID: questionIDs[4],
				text: 'U write okayly'
			}

			teachingAssistant
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/comment')
			.send(comment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.teacherComments.length).to.equal(2);
					done();
				});
			});
		});

		it('should let the owner grade an frq', function(done){
			var grade = {
				contentType: 'question',
				contentIndex: 4,
				points: 5
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(30);
					expect(sub.questionPoints[4]).to.equal(5);
					done();
				});
			});
		})

		it('should let the other teacher grade an frq', function(done){
			var grade = {
				contentType: 'question',
				contentIndex: 4,
				points: 5
			}

			secondTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(30);
					expect(sub.questionPoints[4]).to.equal(5);
					done();
				});
			});
		})

		it('should let the student aide grade an frq', function(done){
			var grade = {
				contentType: 'question',
				contentIndex: 4,
				points: 5
			}

			teachingAssistant
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(grade)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				Submission.findOne({ _id: submission._id }, function(err, sub){
					expect(sub.pointsEarned).to.equal(30);
					expect(sub.questionPoints[4]).to.equal(5);
					done();
				});
			});
		})

		it('should get an exported CSV of values', function(done){
			Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
				const classCode = course.classrooms[0].classCode;
				const csvURL = '/api/course/MikeCS/assignment/' + assignment._id + 
					'/submission/classroom/' + classCode + '/export'

				testTeacher
				.get(csvURL)
				.end(function(err, res){
					expect(res.status).to.equal(200);
					expect(res.body.csv).to.exist;
					done();
				});
			})
		});

		describe('completion', function(done){
			it ('shouldnt allow a student to edit an exercise that has been commented on', function(done){
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
					expect(res.status).to.equal(400);
					done();
				});
			})

			it('shouldnt allow a student to edit an frq that has been commented on', function(done){
				var answer = {
					questionID: questionIDs[4],
					answer: 'Better answer here.'
				}

				testStudent
				.put('/api/course/MikeCS/assignment/' + assignment._id + '/question/submit')
				.send(answer)
				.end(function(err, res){
					expect(res.status).to.equal(400);
					done();
				});
			})
		})
	});
});