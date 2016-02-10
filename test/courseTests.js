var testTeacher = require('./userTests').testTeacher,
	testStudent = require('./userTests').testStudent;

describe('Course', function(){
	it('should meme pretty hard', function(done){
		testTeacher
		.get('/api/profile')
		.expect(200)
		.end(function(res, err){
			done();
		});
	})
})