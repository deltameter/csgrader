var testTeacher = require('./submissionTests').testTeacher,
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
	describe('submission tools', function(){
		it ('should leave a comment on an exercise', function(done){
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

		it ('should leave a comment on an frq', function(done){
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

		it ('should grade an frq', function(done){
			var comment = {
				contentType: 'question',
				contentIndex: 4,
				points: 5
			}

			testTeacher
			.put('/api/course/MikeCS/assignment/' + assignment._id + '/submission/' + submission._id + '/grade')
			.send(comment)
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
			it ('shouldnt allow a student to edit an exercise that has been commented on by the teacher', function(done){
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

			it('shouldnt allow a student to edit an frq that has been commented on by the teacher', function(done){
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
})