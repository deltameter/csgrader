var testTeacher = require('./userTests').testTeacher,
	testStudent = require('./userTests').testStudent
	expect = require('chai').expect;

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

		it('should create given the right info', function(done){
			testTeacher
			.post('/api/course/smushdapcs/classroom/create')
			.send(newClass)
			.end(function(err, res){
				if (err) throw err;
				classroom = res.body;
				newUser.classroomID = res.body.classroomID;
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

		it('should accept the creation of a user', function(done){
			testTeacher
			.post('/api/course/smushdapcs/classroom/createstudent')
			.send(newUser)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(200);
				done();
			});
		});
	});

	describe('registration', function(){
		it('should register a student whose teacher hasn\'t entered them in yet', function(done){
			var regInfo = {
				identifier: 'smushdapcs-' + classroom.classCode,
				password: 'topkekerino'
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