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
	teacherAuth = [auth.requiresLogin, auth.requiresTeacher],
	courseAuth = [auth.requiresLogin, auth.requiresEnrollment],
	teacherCourseAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresEnrollment],
	studentAssignmentAuth = [auth.requiresLogin, auth.requiresStudent, auth.requiresAssignment],
	teacherAssignmentAuth = [auth.requiresLogin, auth.requiresTeacher, auth.requiresAssignment];

var multer = require('multer')();

module.exports = function(app, passport){


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

	app.get('/api/course/:courseCode/', courseAuth, courses.getCourse);

	//******************************
	//***** CLASSROOM ROUTES *******
	//******************************
	//cI = classroom index
	const classroomRoute = '/api/course/:courseCode/classroom/:classCode';

	app.post('/api/course/:courseCode/classroom/create', teacherCourseAuth, classrooms.create);

	app.get('/api/course/:courseCode/classroom', teacherCourseAuth, classrooms.getClassrooms);

	app.get(classroomRoute, teacherCourseAuth, classrooms.getClassroom);

	app.delete(classroomRoute, teacherCourseAuth, classrooms.deleteClassroom);

	app.post(classroomRoute + '/student/create', teacherCourseAuth, classrooms.addStudent);

	app.post(classroomRoute + '/student/import', teacherCourseAuth, multer.single('students'), classrooms.importStudents);

	app.put(classroomRoute + '/student/edit', teacherCourseAuth, classrooms.editStudent);

	app.delete(classroomRoute + '/student/delete/:studentClassID', teacherCourseAuth, classrooms.deleteStudent);

	app.get(classroomRoute + '/grades/export', teacherCourseAuth, classrooms.exportGrades)

	//******************************
	//***** ASSIGNMENT ROUTES ******
	//******************************
	const assignmentRoute = '/api/course/:courseCode/assignment/:assignmentID';
	var teacherEditAssignment = teacherAssignmentAuth.slice();
	teacherEditAssignment.push(auth.assignmentEditable);

	app.get(assignmentRoute, courseAuth, auth.requiresAssignment, assignments.getAssignment);

	app.post('/api/course/:courseCode/assignment/create', teacherCourseAuth, assignments.create);

	app.put(assignmentRoute +'/edit', teacherEditAssignment, assignments.edit);
	
	app.put(assignmentRoute + '/open', teacherEditAssignment, assignments.open);

	app.delete(assignmentRoute + '/delete', teacherCourseAuth, auth.requiresAssignment, assignments.delete);

	//******************************
	//****** QUESTION ROUTES *******
	//******************************
	var teacherEditProblem = teacherEditAssignment.slice();
	teacherEditProblem.push(auth.problemExists);

	app.post(assignmentRoute + '/question/create', teacherEditAssignment, questions.addQuestion);

	app.put(assignmentRoute + '/question/edit', teacherEditProblem, questions.editQuestion);

	//not idempotent so we use post instead of delete
	app.post(assignmentRoute + '/question/delete', teacherEditProblem, questions.deleteQuestion);

	//******************************
	//****** EXERCISE ROUTES *******
	//******************************

	app.post(assignmentRoute + '/exercise/create', teacherEditAssignment, exercises.addExercise);

	app.put(assignmentRoute + '/exercise/edit', teacherEditProblem, exercises.editExercise);

	app.post(assignmentRoute + '/exercise/test', teacherEditProblem, exercises.testExercise);
	
	//not idempotent so we use post instead of delete
	app.post(assignmentRoute + '/exercise/delete', teacherEditProblem, exercises.deleteExercise);

	//******************************
	//***** SUBMISSION ROUTES ******
	//******************************
	var studentSubmitProblem = studentAssignmentAuth.slice();
	studentSubmitProblem.push(auth.problemExists);

	app.get(assignmentRoute + '/submission', studentAssignmentAuth, submissions.getSubmission);

	app.put(assignmentRoute + '/question/submit', studentSubmitProblem, submissions.submitQuestionAnswer);

	app.put(assignmentRoute + '/exercise/submit', studentSubmitProblem, submissions.submitExerciseAnswer);

	app.put(assignmentRoute + '/exercise/save', studentSubmitProblem, submissions.saveExerciseAnswer);
	
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
			return helper.sendError(res, 500, 1000, err.message);
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		app.use(function(err, req, res, next) {
			return helper.sendError(res, 500, 1000, err.message);
		});
	});
}