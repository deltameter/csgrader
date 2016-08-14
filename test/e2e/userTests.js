'use strict';

var app = require('./testPrep').app,
	expect = require('chai').expect,
    supertest = require('supertest'),
    async = require('async'),
    testTeacher = supertest.agent(app),
    secondTeacher = supertest.agent(app),
    teachingAssistant = supertest.agent(app),
    testStudent = supertest.agent(app);

describe('User', function(){
	var emailActivations = { teacher: '', student: '' };

	var testTeacherInfo = {
		firstName: 'John',
		lastName: 'Doe',
		institution: 'John Doe High School',
		password: 'password1', 
		retypePassword: 'password1',
		email: 'johndoe@gmail.com',
		role: 'teacher'
	};

	var testStudentInfo = {
		firstName: 'Little',
		lastName: 'Johnny',
		password: 'apple123',
		retypePassword: 'apple123',
		email: 'litlejohnny@school.com',
		role: 'student'
	};

	var testIdiotInfo = {
		firstName: 'topKEKERINO',
		lastName: 'UR A BIG GUY',
		password: '123',
		retypePassword: '123',
		email: 'asdf',
		role: '123',
	};

	describe('account creation', function(){
		it('should create a teacher given the correct information', function(done){

			testTeacher
			.post('/api/user/join')
			.send(testTeacherInfo)
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				emailActivations.teacher = res.body.activationCode;
				

				testTeacher.post('/auth/local')
				.send({ email: 'johndoe@gmail.com', password: 'password1' })
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;
					done();
				});
			});
		});

		it('should create a student given the correct information', function(done){
			testStudent
			.post('/api/user/join')
			.send(testStudentInfo)
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				emailActivations.student = res.body.activationCode;
				testStudent.post('/auth/local')
				.send({ email: 'litlejohnny@school.com', password: 'apple123' })
				.expect(200)
				.end(function(err, res) {
					done();
				});
			});
		});

		it('should not create a student with the wrong information', function(done){
			testStudent
			.post('/api/user/join')
			.send(testIdiotInfo)
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(400);
				done();
			});
		});
	});
	
	describe('email activation', function(){
		it('should deny unauthenticated users', function(done){
			supertest
			.agent(app)
			.put('/api/user/emailActivation')
			.send({ activationCode: 'topkek' })
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it('should deny someone with the wrong activation code', function(done){
			testStudent
			.put('/api/user/emailActivation')
			.send({ activationCode: 'topkek' })
			.end(function(err, res){
				expect(res.status).to.equal(400);
				done();
			});
		});

		it('should authenticate users with real codes', function(done){
			async.parallel({
				teacher: function(callback){
					testTeacher
					.put('/api/user/emailActivation')
					.send({ activationCode: emailActivations.teacher })
					.expect(200)
					.end(function(err, res){
						callback(err);
					});	
				},
				student: function(callback){
					testStudent
					.put('/api/user/emailActivation')
					.send({ activationCode: emailActivations.student })
					.expect(200)
					.end(function(err, res){
						callback(err);
					});	
				}
			}, function(err){
				if (err) throw err;
				done();
			});
		});
	})

	describe('authentication', function(){
		it('should deny unauthenticated users', function(done){
			supertest.agent(app)
			.get('/api/user')
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(401);
				done();
			});
		});

		it('should get authenticate users and return their own profile', function(done){
			testTeacher
			.get('/api/user')
			.expect(200)
			.end(function(err, res){
				if (err) throw err;

				expect(res.body.role).to.equal('teacher');
				done();
			});
		});
	})

	describe('other roles', function(){
		it('should create another teacher', function(done){
			var secondTeacherInfo = {
				firstName: 'Jane',
				lastName: 'Doe',
				institution: 'Jane Doe High School',
				password: 'password1', 
				retypePassword: 'password1',
				email: 'janedoe@gmail.com',
				role: 'teacher'
			};
			
			secondTeacher
			.post('/api/user/join')
			.send(secondTeacherInfo)
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				const secondActivationCode = res.body.activationCode;
				

				secondTeacher
				.post('/auth/local')
				.send({ email: 'janedoe@gmail.com', password: 'password1' })
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;

					secondTeacher
					.put('/api/user/emailActivation')
					.send({ activationCode: secondActivationCode })
					.expect(200)
					.end(function(err, res){
						done()
					});	
				});
			});
		})

		it('should create a teaching assistant', function(done){
			var TAInfo = {
				firstName: 'Teaching',
				lastName: 'Assistant',
				institution: 'John Doe High School',
				password: 'password1', 
				retypePassword: 'password1',
				email: 'teachingassistant@gmail.com',
				role: 'aide'
			};
			
			teachingAssistant
			.post('/api/user/join')
			.send(TAInfo)
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				const TACode = res.body.activationCode;
				
				teachingAssistant
				.post('/auth/local')
				.send({ email: 'teachingassistant@gmail.com', password: 'password1' })
				.expect(200)
				.end(function(err, res) {
					if (err) throw err;

					teachingAssistant
					.put('/api/user/emailActivation')
					.send({ activationCode: TACode })
					.expect(200)
					.end(function(err, res){
						done()
					});	
				});
			});
		})
	})
});

//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;
module.exports.teachingAssistant = teachingAssistant;
module.exports.secondTeacher = secondTeacher;