'use strict';

var general = require(__base + 'routes/controllers/general'),
	users = require(__base + 'routes/controllers/users'),
	courses = require(__base + 'routes/controllers/courses'),
	assignments = require(__base + 'routes/controllers/assignments'),
	exercises = require(__base + 'routes/controllers/exercises'),
	questions = require(__base + 'routes/controllers/questions'),
	submissions = require(__base + 'routes/controllers/submissions'),
	classrooms = require(__base + 'routes/controllers/classrooms'),
	helper = require(__base + 'routes/libraries/helper');

var auth = require(__base + 'routes/middlewares/authorization');

var studentAuth = [auth.requiresLogin, auth.requiresStudent],
	teacherAuth = [auth.requiresLogin, auth.requiresTeacher];

var multer = require('multer')();

module.exports = function(app, passport){


	//******************************
	//******** USER ROUTES *********
	//******************************
	
	//seperate this out into own function?
	app.post('/auth/local', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err){ 
				return helper.sendError(res, 401, 'An error occured while you were trying to access the database.');
			}

			if (!user){
				return helper.sendError(res, 401, 'That user does not exist or you did not enter the correct password.');
			}

			req.logIn(user, function(err) {
				if (err){ 
					return helper.sendError(res, 401, 'An error occured while you were trying to access the database.');
				}
				return users.getSelf(req, res);
			});
		})(req, res, next);
	});


	app.get('/api/user', auth.requiresLogin, users.getSelf);

	app.post('/api/user/join', users.create);

	app.put('/api/user/emailActivation', users.emailActivation)

	app.post('/api/user/logout', auth.requiresLogin, users.logout);

	//******************************
	//******* COURSE ROUTES ********
	//******************************

	//Get a list of user's courses
	app.get('/api/course', auth.requiresLogin, courses.getCourses);

	app.post('/api/course/create', teacherAuth, courses.create);

	app.put('/api/course/register', studentAuth, courses.register);

	app.get('/api/course/:courseCode/', auth.requiresLogin, courses.getCourse);

	//******************************
	//***** CLASSROOM ROUTES *******
	//******************************
	//cI = classroom index
	const classroomRoute = '/api/course/:courseCode/classroom/:classCode';

	app.post('/api/course/:courseCode/classroom/create', teacherAuth, classrooms.create);

	app.get('/api/course/:courseCode/classroom', teacherAuth, classrooms.getClassrooms);

	app.get(classroomRoute, teacherAuth, classrooms.getClassroom);

	app.delete(classroomRoute, teacherAuth, classrooms.deleteClassroom);

	app.post(classroomRoute + '/student/create', teacherAuth, classrooms.addStudent);

	app.post(classroomRoute + '/student/import', teacherAuth, multer.single('students'), classrooms.importStudents);

	app.put(classroomRoute + '/student/edit', teacherAuth, classrooms.editStudent);

	app.delete(classroomRoute + '/student/delete/:studentClassID', teacherAuth, classrooms.deleteStudent);

	app.get(classroomRoute + '/grades/export', teacherAuth, classrooms.exportGrades)

	//******************************
	//***** ASSIGNMENT ROUTES ******
	//******************************
	const assignmentRoute = '/api/course/:courseCode/assignment/:assignmentID';

	app.get(assignmentRoute, auth.requiresLogin, assignments.getAssignment);

	app.post('/api/course/:courseCode/assignment/create', teacherAuth, assignments.create);

	app.put(assignmentRoute +'/edit', teacherAuth, assignments.edit);
	
	app.put(assignmentRoute + '/open', teacherAuth, assignments.open);

	app.delete(assignmentRoute + '/delete', teacherAuth, assignments.delete);

	//******************************
	//****** QUESTION ROUTES *******
	//******************************

	app.post(assignmentRoute + '/question/create', teacherAuth, questions.addQuestion);

	app.put(assignmentRoute + '/question/edit', teacherAuth, questions.editQuestion);

	//not idempotent so we use post instead of delete
	app.post(assignmentRoute + '/question/delete', teacherAuth, questions.deleteQuestion);

	//******************************
	//****** EXERCISE ROUTES *******
	//******************************

	app.post(assignmentRoute + '/exercise/create', teacherAuth, exercises.addExercise);

	app.put(assignmentRoute + '/exercise/edit', teacherAuth, exercises.editExercise);

	app.post(assignmentRoute + '/exercise/test', teacherAuth, exercises.testExercise);
	
	//not idempotent so we use post instead of delete
	app.post(assignmentRoute + '/exercise/delete', teacherAuth, exercises.deleteExercise);

	//******************************
	//***** SUBMISSION ROUTES ******
	//******************************

	app.get(assignmentRoute + '/submission', studentAuth, submissions.getSubmission);

	app.put(assignmentRoute + '/question/submit', studentAuth, submissions.submitQuestionAnswer);

	app.put(assignmentRoute + '/exercise/submit', studentAuth, submissions.submitExerciseAnswer);

	app.put(assignmentRoute + '/exercise/save', studentAuth, submissions.saveExerciseAnswer);
	
	//******************************
	//****** CS GRADER ROUTES ******
	//******************************
	
	//app.get('/', general.showIndex);
	app.get('*', function(req, res){
		return res.sendFile(__base + '/views/base.html');
	});

	//******************************
	//*** ERROR HANDLING ROUTES ****
	//******************************

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
			return helper.sendError(res, 500, err.message);
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		app.use(function(err, req, res, next) {
			return helper.sendError(res, 500, err.message);
		});
	});
}