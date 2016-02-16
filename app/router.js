'use strict';

var general = require(__base + 'routes/controllers/general'),
	users = require(__base + 'routes/controllers/users'),
	courses = require(__base + 'routes/controllers/courses'),
	assignments = require(__base + 'routes/controllers/assignments'),
	submissions = require(__base + 'routes/controllers/submissions'),
	classrooms = require(__base + 'routes/controllers/classrooms');

var auth = require (__base + 'routes/middlewares/authorization'),
	studentAuth = [auth.requiresLogin, auth.requiresStudent],
	teacherAuth = [auth.requiresLogin, auth.requiresTeacher],
	courseAuth = [auth.requiresLogin, auth.requiresEnrollment],
	teacherCourseAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresEnrollment],
	studentAssignmentAuth = [auth.requiresLogin, auth.requiresStudent, auth.requiresAssignment],
	teacherAssignmentAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresAssignment];

var multer = require('multer')();

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
	app.post('/api/user/join', users.create);
	app.put('/api/user/emailActivation', users.emailActivation)
	app.get('/api/user/logout', auth.requiresLogin, users.logout);

	//******************************
	//******* COURSE ROUTES ********
	//******************************
	
	//app.param('courseCode', courses.load);

	app.post('/api/course/create', teacherAuth, courses.create);
	app.put('/api/course/register', studentAuth, courses.register);

	//******************************
	//***** CLASSROOM ROUTES *******
	//******************************

	app.post('/api/course/:courseCode/classroom/create', teacherCourseAuth, classrooms.create);

	app.post('/api/course/:courseCode/classroom/student/create', teacherCourseAuth, classrooms.addStudent);

	app.post('/api/course/:courseCode/classroom/student/import', teacherCourseAuth, multer.single('students'), classrooms.importStudents);

	app.put('/api/course/:courseCode/classroom/student/edit', teacherCourseAuth, classrooms.editStudent);

	app.delete('/api/course/:courseCode/classroom/student/delete', teacherCourseAuth, classrooms.deleteStudent);

	app.get('/api/course/:courseCode/classroom/grades/export', teacherCourseAuth, classrooms.exportGrades)

	//******************************
	//***** ASSIGNMENT ROUTES ******
	//******************************
	var assignmentRoute = '/api/course/:courseCode/assignment/:assignmentID';

	app.get(assignmentRoute, courseAuth, auth.requiresAssignment, assignments.getAssignment);

	app.post('/api/course/:courseCode/assignment/create', teacherCourseAuth, assignments.create);

	app.put(assignmentRoute +'/edit', teacherAssignmentAuth, assignments.edit);
	
	app.put(assignmentRoute + '/open', teacherAssignmentAuth, assignments.open);

	app.post(assignmentRoute + '/question/create', teacherAssignmentAuth, assignments.addQuestion);

	app.put(assignmentRoute + '/question/edit', teacherAssignmentAuth, assignments.editQuestion);

	app.post(assignmentRoute + '/exercise/create', teacherAssignmentAuth, assignments.addExercise);
	
	//******************************
	//***** SUBMISSION ROUTES ******
	//******************************

	app.post(assignmentRoute + '/submission/create', studentAssignmentAuth, submissions.create);

	app.put(assignmentRoute + '/submit/question', studentAssignmentAuth, submissions.submitQuestionAnswer);

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