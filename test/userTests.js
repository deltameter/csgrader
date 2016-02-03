var app = require('./testprep').app,
	testUser = require('./testprep').testUser,
	should = require('chai').should(),
    supertest = require('supertest');

describe('User', function(){
	it('should create a user given the correct information', function(done){
		var newUser = {
			firstName: 'hi',
			lastName: 'topkeke',
			username: 'muhusername',
			password: 'topkek12', 
			retypePassword: 'topkek12',
			email: 'cuck@jebbush.com'
		};

		supertest(app)
			.post('/api/user/create')
			.send(newUser)
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				done();
			});
	});
});