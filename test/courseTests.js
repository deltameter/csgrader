var testTeacher = require('./userTests').testTeacher,
	testStudent = require('./userTests').testStudent,
	async = require('async'),
	expect = require('chai').expect;

var mongoose = require('mongoose'),
	Course = mongoose.model('Course');

describe('Course', function(){
	var classroom = {};

	describe('creation', function(){
		var apcsCourse = {
			name: 'SMUSHD AP CS',
			courseCode: 'smushdapcs',
			password: 'topkekerino'
		}

		var rejectCourse = {
			name: 'meme master mohan',
			courseCode: '2345333'
		}

		it('should reject requests from students', function(done){
			testStudent
			.post('/api/course/create')
			.send(apcsCourse)
			.end(function(err, res){
				expect(res.status).to.equal(401);
				done();
			});
		});

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
	});

	describe('classroom', function(){
		var newClass = {
			name: '6th Period'
		}

		var newUser = {
			firstName: 'little',
			lastName: 'johnny',
			gradebookID: '123'
		}

		var modifyUser = {};

		it('should create given the right info', function(done){
			testTeacher
			.post('/api/course/smushdapcs/classroom/create')
			.send(newClass)
			.end(function(err, res){
				if (err) throw err;
				classroom = res.body;
				newUser.classCode = res.body.classCode;
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('shouldn\'t register a student whose teacher hasn\'t entered them in yet', function(done){
			var regInfo = {
				identifier: 'smushdapcs-' + classroom.classCode,
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
			var newUser2 = JSON.parse(JSON.stringify(newUser));
			var newUser3 = JSON.parse(JSON.stringify(newUser));
			newUser2.gradebookID = '234';
			newUser3.gradebookID = '345';

			async.parallel([
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/classroom/student/create')
					.send(newUser)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);
						callback();
					});
				},
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/classroom/student/create')
					.send(newUser2)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);
						callback();
					});
				},
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/classroom/student/create')
					.send(newUser3)
					.end(function(err, res){
						if (err) throw err;
						expect(res.status).to.equal(200);
						modifyUser = res.body;
						callback();
					});
				}
			], function(err, results){
				Course.find({}, function(err, courses){
					expect(courses[0].classrooms[0].students.length).to.equal(3);
					done();
				});
			});
		});

		it('should accept a CSV file of students and create them all', function(done){
			testTeacher
			.post('/api/course/smushdapcs/classroom/student/import')
			.field('classCode', classroom.classCode)
			.attach('students', __dirname + '/resources/students.csv')
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should edit a user', function(done){
			var editUser = {
				classCode: classroom.classCode,
				studentID: modifyUser._id,
				firstName: 'Big',
				lastName: 'Johnny',
				gradebookID: '777'
			}

			testTeacher
			.put('/api/course/smushdapcs/classroom/student/edit')
			.send(editUser)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);

				Course.find({}, function(err, courses){
					expect(courses[0].classrooms[0].students[2].firstName).to.equal('Big');
					expect(courses[0].classrooms[0].students[2].lastName).to.equal('Johnny');
					expect(courses[0].classrooms[0].students[2].gradebookID).to.equal('777');
					done();
				});
			});
		});

		it('should delete a user', function(done){
			var deleteUser = {
				studentID: modifyUser._id,
				classCode: classroom.classCode
			}

			testTeacher
			.delete('/api/course/smushdapcs/classroom/student/delete')
			.send(deleteUser)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);

				Course.find({}, function(err, courses){
					expect(courses[0].classrooms[0].students.length).to.equal(5);
					done();
				});
			});
		});
	});

	describe('registration', function(){
		it('shouldn\'t register a student with an ambiguous name', function(done){
			var regInfo = {
				identifier: 'smushdapcs-' + classroom.classCode,
				password: 'topkekerino'
			}

			testStudent
			.put('/api/course/register')
			.send(regInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(400);
				expect(res.body.errorCode).to.equal(3001);
				done();
			});
		});

		it('should register a student with an ambiguous name after they input their gradebookID', function(done){
			var regInfo = {
				identifier: 'smushdapcs-' + classroom.classCode,
				password: 'topkekerino',
				studentGradebookID: '123'
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
				identifier: 'smushdapcs-' + classroom.classCode,
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
	});
});


//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;