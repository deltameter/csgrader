'use strict';

var general = require(__base + 'routes/controllers/general'),
	users = require(__base + 'routes/controllers/users'),
	courses = require(__base + 'routes/controllers/courses'),
	assignments = require(__base + 'routes/controllers/assignments'),
	classrooms = require(__base + 'routes/controllers/classrooms');

var auth = require (__base + 'routes/middlewares/authorization'),
	studentAuth = [auth.requiresLogin, auth.requiresStudent],
	teacherAuth = [auth.requiresLogin, auth.requiresTeacher],
	courseAuth = [auth.requiresLogin, auth.requiresEnrollment],
	teacherCourseAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresEnrollment];

module.exports = function(app, passport){

	//******************************
	//****** CS GRADER ROUTES ******
	//******************************
	
	app.get('/', general.showIndex);

	//******************************
	//******** USER ROUTES *********
	//******************************
	
	//seperate this out into own function?
	app.post('/auth/local', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err){ 
				return helper.sendError(res, 401, 1000, 'An error occured while you were trying to access the database.');
			}

			if (!user){
				return helper.sendError(res, 401, 1001, 'That user does not exist or you did not enter the correct password.');
			}

			req.logIn(user, function(err) {
				if (err){ 
					return helper.sendError(res, 401, 1000, 'An error occured while you were trying to access the database.');
				}
				return users.signedIn(req, res);
			});
		})(req, res, next);
	});


	app.get('/api/profile', auth.requiresLogin, users.getSelf);
	app.post('/api/users/join', users.create);
	app.put('/api/users/emailActivation', users.emailActivation)
	app.get('/api/logout', auth.requiresLogin, users.logout);

	//******************************
	//******* COURSE ROUTES ********
	//******************************

	app.get('/api/course/new', teacherAuth, courses.showCourseCreation);

	app.post('/course/join', studentAuth, courses.joinCourse);
	
	app.post('/course/new', teacherAuth, courses.create);


	app.get('/course/:courseID', courseAuth, courses.showCourse);

	//******************************
	//***** ASSIGNMENT ROUTES ******
	//******************************

	app.get('/course/:courseID/assignment/:assignmentID', courseAuth, assignments.showAssignment);

	//******************************
	//***** CLASSROOM ROUTES *******
	//******************************

	app.post('/course/:courseID/classroom/new', teacherCourseAuth, classrooms.create);

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