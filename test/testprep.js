process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
	
mongoose.createConnection(require(__dirname + '/../config/config').mongoURL, function(err){
	if (err) throw err;
	mongoose.connection.db.dropDatabase(function(err){
		if (err) throw err;
	});
});

var app = require('../server').app,
	supertest = require('supertest');
	user = supertest.agent(app);

//Create a test user to use with our tests
before(function(done){
	var testUser = {
		firstName: 'John',
		lastName: 'Doe',
		username: 'TestUser',
		password: 'password1', 
		retypePassword: 'password1',
		email: 'johndoe@gmail.com'
	};

	supertest(app)
		.post('/api/user/create')
		.send(testUser)
		.expect(200)
		.end(function(err, res){
			if (err) throw err;

			user.post('/auth/local')
				.send({ username: 'johndoe@gmail.com', password: 'password1' })
				.expect(302)
				.end(function(err, res) {
					done();
				});
		});
})

module.exports.app = app;
module.exports.testUser = user;
