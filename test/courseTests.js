'use strict';

var testTeacher = require('./userTests').testTeacher,
	testStudent = require('./userTests').testStudent,
	async = require('async'),
	expect = require('chai').expect;

var mongoose = require('mongoose'),
	Course = mongoose.model('Course');

var classroom = {};

describe('Course', function(){
	describe('creation', function(){
		var apcsCourse = {
			name: 'Michael\'s CS Class',
			courseCode: 'MikeCS',
			password: 'topkekerino',
			defaultLanguage: 'Java'
		}

		var deleteCourse = {
			name: 'DELETE ME FAM',
			courseCode: 'DELETE',
			password: 'deleterino',
			defaultLanguage: 'Java'
		}

		var rejectCourse = {
			name: 'meme master mohan',
			courseCode: '2345333',
			defaultLanguage: 'Java'
		}

		it('should create a course given the right data', function(done){
			testTeacher
			.post('/api/course/create')
			.send(apcsCourse)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should reject courses with incomplete data', function(done){
			testTeacher
			.post('/api/course/create')
			.send(rejectCourse)
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it ('should "delete" a course', function(done){
			testTeacher
			.post('/api/course/create')
			.send(deleteCourse)
			.end(function(err, res){
				expect(res.status).to.equal(200);

				const deleteInfo = {
					password: 'password1'
				}

				testTeacher
				.delete('/api/course/' + 'DELETE')
				.send(deleteInfo)
				.end(function(err, res){
					expect(res.status).to.equal(200);
					done();
				});
			});
		})

		it('should get a user\'s courses', function(done){
			testTeacher
			.get('/api/course')
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

	});

	describe('classroom', function(){
		var newClass = {
			name: '6th Period'
		}

		var deleteClass = {
			name: 'DELETE CLASS'
		}

		var newStudent = {
			firstName: 'little',
			lastName: 'johnny',
			gradebookID: '123'
		}

		var modifyUser = {};

		it('should create given the right info', function(done){
			testTeacher
			.post('/api/course/MikeCS/classroom/create')
			.send(newClass)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);

				classroom = res.body;
				newStudent.classCode = res.body.classCode;
				
				testTeacher
				.get('/api/course/MikeCS/classroom/' + res.body.classCode)
				.end(function(err, res){
					if (err) throw err;
					expect(res.status).to.equal(200);

					Course.findOne({ courseCode: 'DELETE' }, function(err, course){
						expect(course).to.equal(null);
						done();
					});
				});
			});
		});

		it('should delete a classroom', function(done){
			testTeacher
			.post('/api/course/MikeCS/classroom/create')
			.send(deleteClass)
			.end(function(err, res){
				if (err) throw err;
				var classCode = res.body.classCode;


				testTeacher
				.delete('/api/course/MikeCS/classroom/' + classCode)
				.send({ password: 'password1' })
				.end(function(err, res){
					if (err) throw err;
					expect(res.status).to.equal(200);
					done();
				});
			})
		})

		it('shouldn\'t register a student whose teacher hasn\'t entered them in yet', function(done){
			var regInfo = {
				identifier: 'MikeCS-' + classroom.classCode,
				password: 'topkekerino'
			}

			testStudent
			.put('/api/course/register')
			.send(regInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(400);
				done();
			});
		});

		it('should accept the creation of several users', function(done){
			var newStudent2 = JSON.parse(JSON.stringify(newStudent));
			var newStudent3 = JSON.parse(JSON.stringify(newStudent));
			newStudent2.gradebookID = '234';
			newStudent2.firstName = 'Student2First';
			newStudent2.lastName = 'Student2Last';
			newStudent3.gradebookID = '345';
			newStudent3.firstName = 'Student3First';
			newStudent3.lastName = 'Student3Last';

			async.parallel([
				function(callback){
					testTeacher
					.post('/api/course/MikeCS/classroom/' + classroom.classCode +'/student/create')
					.send(newStudent)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);
						callback();
					});
				},
				function(callback){
					testTeacher
					.post('/api/course/MikeCS/classroom/' + classroom.classCode + '/student/create')
					.send(newStudent2)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);
						callback();
					});
				},
				function(callback){
					testTeacher
					.post('/api/course/MikeCS/classroom/' + classroom.classCode +'/student/create')
					.send(newStudent3)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);

						modifyUser = res.body;
						callback();
					});
				}
			], function(err, results){
				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					expect(course.classrooms[0].students.length).to.equal(3);
					done();
				});
			});
		});

		it('should accept a CSV file of students and create them all', function(done){
			testTeacher
			.post('/api/course/MikeCS/classroom/' + classroom.classCode +'/student/import')
			.attach('students', __dirname + '/resources/students.csv')
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should edit a student', function(done){
			var editUser = {
				classCode: classroom.classCode,
				studentClassID: modifyUser._id,
				firstName: 'Big',
				lastName: 'Johnny',
				gradebookID: '777'
			}

			testTeacher
			.put('/api/course/MikeCS/classroom/' + classroom.classCode +'/student/edit')
			.send(editUser)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);

				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					var student = course.classrooms[0].students.find(function(student){
						return student._id.toString() === modifyUser._id.toString();
					})

					expect(student.firstName).to.equal('Big');
					expect(student.lastName).to.equal('Johnny');
					expect(student.gradebookID).to.equal('777');
					done();
				});
			});
		});

		it('should delete a student', function(done){
			testTeacher
			.delete('/api/course/MikeCS/classroom/' + classroom.classCode + '/student/delete/' + modifyUser._id)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);

				Course.findOne({ courseCode: 'MikeCS' }, function(err, course){
					expect(course.classrooms[0].students.length).to.equal(5);
					done();
				});
			});
		});
	});

	describe('registration', function(){
		it('shouldn\'t register a student who hasn\'t entered a gradebookID' , function(done){
			var regInfo = {
				identifier: 'MikeCS-' + classroom.classCode,
				password: 'topkekerino'
			}

			testStudent
			.put('/api/course/register')
			.send(regInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(400);
				done();
			});
		});

		it('should register a student after they input their gradebookID', function(done){
			var regInfo = {
				identifier: 'MikeCS-' + classroom.classCode,
				password: 'topkekerino',
				gradebookID: '123'
			}

			testStudent
			.put('/api/course/register')
			.send(regInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('shouldn\'t register a student who\'s already registered', function(done){
			var regInfo = {
				identifier: 'MikeCS-' + classroom.classCode,
				password: 'topkekerino',
				gradebookID: '123'
			}

			testStudent
			.put('/api/course/register')
			.send(regInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(400);
				done();
			});
		});
	});
});


//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;
