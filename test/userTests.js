var app = require('./testprep').app,
	expect = require('chai').expect,
    supertest = require('supertest'),
    async = require('async'),
    testTeacher = supertest.agent(app),
    testStudent = supertest.agent(app);

describe('User', function(){
	var emailActivations = { teacher: '', student: '' };

	var testTeacherInfo = {
		firstName: 'John',
		lastName: 'Doe',
		password: 'password1', 
		retypePassword: 'password1',
		email: 'johndoe@gmail.com',
		accountType: 'teacher'
	};

	var testStudentInfo = {
		firstName: 'Little',
		lastName: 'Johnny',
		password: 'apple123',
		retypePassword: 'apple123',
		email: 'litlejohnny@school.com',
		accountType: 'student'
	};

	var testIdiotInfo = {
		firstName: 'topKEKERINO',
		lastName: 'UR A BIG GUY',
		password: '123',
		retypePassword: '123',
		email: 'asdf',
		accountType: '123',
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
			supertest.agent(app)
			.put('/api/user/emailActivation')
			.send({ activationCode: 'topkek' })
			.end(function(err, res){
				expect(res.status).to.equal(401);
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
			.get('/api/profile')
			.end(function(err, res){
				if (err) throw err;
				expect(res.status).to.equal(401);
				done();
			});
		});

		it('should get authenticate users and return their own profile', function(done){
			testTeacher
			.get('/api/profile')
			.expect(200)
			.end(function(err, res){
				if (err) throw err;

				expect(res.body.bIsTeacher).to.equal(true);
				done();
			});
		});
	})
});

//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;