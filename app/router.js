'use strict';

var CSGrader = require(__base + 'routes/controllers/csgrader'),
	users = require(__base + 'routes/controllers/users'),
	courses = require(__base + 'routes/controllers/courses'),
	assignments = require(__base + 'routes/controllers/assignments');

var auth = require (__base + 'routes/middlewares/authorization'),
	teacherAuth = [auth.requiresLogin, auth.requiresTeacher],
	courseAuth = [auth.requiresLogin, auth.requiresEnrollment],
	teacherCourseAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresEnrollment];

module.exports = function(app, passport){

	//******************************
	//****** CS GRADER ROUTES ******
	//******************************
	app.get('/', CSGrader.showIndex);

	//******************************
	//******** USER ROUTES *********
	//******************************

	app.post('/auth/local', 
		passport.authenticate('local', { 
			failureRedirect: '/', 
		}), users.signedIn);

	app.get('/join', users.showJoinPage);
	app.post('/join', users.create);

	app.get('/profile', auth.requiresLogin, users.showProfile);
	app.get('/profile/activate', auth.requiresLogin, users.showActivationInstructions);
	app.get('/profile/activate/:activationString', auth.requiresLogin, users.emailActivation);

	//******************************
	//******* COURSE ROUTES ********
	//******************************

	app.get('/course/new', teacherAuth, courses.showCourseCreation);
	app.post('/course/new', teacherAuth, courses.create);


	app.get('/course/:courseID', courseAuth, courses.showCourse);

	//******************************
	//***** ASSIGNMENT ROUTES ******
	//******************************

	app.get('/course/:courseID/:assignmentID', courseAuth, assignments.showAssignment);

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
}