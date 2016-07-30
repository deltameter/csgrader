(function(){
	'use strict';
	
	function arrayObjectIndexOf(myArray, property, searchTerm) {
		for(var i = 0, len = myArray.length; i < len; i++) {
			if (myArray[i][property] === searchTerm) return i;
		}
		return -1;
	}

	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			getAssignment: getAssignment,
			getAssignmentToGrade: getAssignmentToGrade,
			getAll: getAll,
			search: search,
			createAssignment: createAssignment,
			openAssignment: openAssignment,
			closeAssignment: closeAssignment,
			calculateTotalPoints: calculateTotalPoints
		};

		function parseAssignment(assignment, submission){
			assignment.content = new Array(assignment.questions.length + assignment.exercises.length);

			//if a submission is included, load it. This means either a student is loading this,
			//or a teacher/aide is viewing a student submission
			if (submission){
				assignment.pointsEarned = 0; 

				for (var i = 0; i < assignment.questions.length; i++){
					//parse it into an int if multiple choice
					if (assignment.questions[i].questionType === 'mc'){
						submission.questionAnswers[i] = parseInt(submission.questionAnswers[i]);
					}

					assignment.pointsEarned += submission.questionPoints[i];

					assignment.questions[i].studentAnswer = submission.questionAnswers[i];
					assignment.questions[i].tries = submission.questionTries[i];
					assignment.questions[i].pointsEarned = submission.questionPoints[i];
					assignment.questions[i].bIsCorrect = submission.questionsCorrect[i];
				}

				for (var i = 0; i < assignment.exercises.length; i++){

					assignment.pointsEarned += submission.exercisePoints[i];

					assignment.exercises[i].code = submission.exerciseAnswers[i];
					assignment.exercises[i].tries = submission.exerciseTries[i];
					assignment.exercises[i].pointsEarned = submission.exercisePoints[i];
					assignment.exercises[i].bIsCorrect = submission.exercisesCorrect[i];
				}

				//append the teacher's comments
				for (var i = 0; i < submission.teacherComments.length; i++){
					const comment = submission.teacherComments[i];
					//since content is 'question' or 'exercise', we can use the array selector to make this more general
					const property = comment.contentType + 's';
					const index = assignment[property].map(function(content){
						return content._id;
					}).indexOf(comment.contentID)

					assignment[property][index].teacherCommentText = comment.text;
				}
			}

			for (var i = 0; i < assignment.contentOrder.length; i++){
				//true = exercise, false = question
				//content order is the type of problem, then the ID of said problem

				if (assignment.contentOrder[i].indexOf('exercise') === 0){
					//get the id by removing exercise from the contentOrder
					var id = assignment.contentOrder[i].split('exercise')[1];
					var location = arrayObjectIndexOf(assignment.exercises, '_id', id);

					assignment.content[i] = assignment.exercises[location];
					assignment.content[i].type = 'exercise';
					assignment.content[i].exerciseIndex = location;

				}else if (assignment.contentOrder[i].indexOf('question') === 0){
					//get the id by removing question from the contentOrder
					var id = assignment.contentOrder[i].split('question')[1];
					var location = arrayObjectIndexOf(assignment.questions, '_id', id);

					assignment.content[i] = assignment.questions[location];
					assignment.content[i].type = 'question';
					assignment.content[i].questionIndex = location;
				}
			}

			return assignment;
		}

		function getAssignment(courseCode, assignmentID){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID).then(
				function Success(res){
					return parseAssignment(res.data.assignment, res.data.submission)
				}
			);
		};

		function getAssignmentToGrade(courseCode, assignmentID, submissionID){
			const submissionRoute = '/api/course/' + courseCode 
				+ '/assignment/' + assignmentID + '/submission/' + submissionID;

			return $http.get(submissionRoute).then(
				function Success(res){
					return parseAssignment(res.data.assignment, res.data.submission)
				}
			);
		}

		function getAll(courseCode){
			return $http.get('/api/course/' + courseCode + '/assignment').then(
				function Success(res){
					return res.data.assignments;
				}
			);
		}

		function search(courseCode, searchTerms){
			var search = { searchTerms: searchTerms };
			return $http.get('/api/course/' + courseCode + '/assignment', { params: search }).then(
				function Success(res){
					return res.data.assignments;
				}
			);
		}
		
		function createAssignment(courseCode, newAssignment){
			return $http.post('/api/course/' + courseCode + '/assignment/create', newAssignment).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			);
		};

		function openAssignment(courseCode, assignmentID, openInfo){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/open', openInfo).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			);
		}

		function closeAssignment(courseCode, assignmentID, password){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/close', { password: password }).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			);
		}

		function calculateTotalPoints(assignment){
			var totalPoints = 0;

			assignment.exercises.forEach(function(exercise){
				totalPoints += exercise.pointsWorth;
			})

			assignment.questions.forEach(function(question){
				totalPoints += question.pointsWorth;
			})

			return totalPoints;
		}
	})

	.factory('QuestionFactory', function($http){

		return {
			addQuestion: addQuestion,
			editQuestion: editQuestion,
			deleteQuestion: deleteQuestion,
			submitQuestion: submitQuestion
		};

		function addQuestion(courseCode, assignmentID){
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/create').then(
				function Success(res){
					var newQuestion = res.data;
					newQuestion.type = 'question';
					return newQuestion;
				}
			);
		}

		function editQuestion(courseCode, assignmentID, question){
			var questionEdit = angular.copy(question)
			questionEdit.questionID = question._id;
			delete questionEdit._id;

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/edit', questionEdit);
		}

		function deleteQuestion(courseCode, assignmentID, questionID){
			var requestInfo = { 
				url: '/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/delete',
				method: 'DELETE', 
				data: { questionID: questionID }, 
				headers: {"Content-Type": "application/json;charset=utf-8" }
			};

			return $http(requestInfo);
		}

		function submitQuestion(courseCode, assignmentID, questionID, answer){
			var questionAnswer = {
				answer: answer,
				questionID: questionID
			}

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/submit', questionAnswer);
		}
	})

	.factory('ExerciseFactory', function($http){
		return {
			addExercise: addExercise,
			editExercise: editExercise, 
			testExercise: testExercise,
			submitExercise: submitExercise,
			deleteExercise: deleteExercise,
			createNewFile: createNewFile,
			deleteFile: deleteFile
		};

		function addExercise(courseCode, assignmentID){
			var exercise = {
				title: 'My Exercise',
				language: 'Java'
			}

			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/create', exercise).then(
				function Success(res){
					var newExercise = res.data;
					newExercise.type = 'exercise';
					return newExercise;
				}
			);
		}

		function editExercise(courseCode, assignmentID, exercise){
			var exerciseEdit = {
				exerciseID: exercise._id,
				title: exercise.title,
				context: exercise.context,
				code: exercise.code,
				tests: exercise.tests,
				triesAllowed: exercise.triesAllowed,
				pointsWorth: exercise.pointsWorth
			}

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/edit', exerciseEdit);
		}

		function testExercise(courseCode, assignmentID, exerciseID, code){
			var exerciseTest = {
				exerciseID: exerciseID,
				code: code
			}

			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/test', exerciseTest);

		}

		function submitExercise(courseCode, assignmentID, exerciseID, code){
			var submission = {
				exerciseID: exerciseID,
				code: code
			}

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/submit', submission);
		}

		function deleteExercise(courseCode, assignmentID, exerciseID){
			var requestInfo = { 
				url: '/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/delete',
				method: 'DELETE', 
				data: { exerciseID: exerciseID }, 
				headers: {"Content-Type": "application/json;charset=utf-8" }
			};

			return $http(requestInfo);
		}

		function createNewFile(filename, exercise){
			//if it doesnt have an ext, use the default
			if (typeof filename.split('.')[1] === 'undefined'){
				filename += exercise.language.fileExt;
			}

			//check if there is a code file with the same name
			
			const bDistinctCodeName = exercise.code.map(function(code){ return code.name }).indexOf(filename) === -1;

			//check if there is a test file with the same name or if tests doesnt exist (not shown to students)
			const bDistinctTestName = typeof exercise.tests === 'undefined' || exercise.tests.map(function(test){ return test.name }).indexOf(filename) === -1;

			if (bDistinctCodeName && bDistinctTestName){
				return {
					name: filename,
					code: '//' + filename
				}
			}

			return false;
		}

		function deleteFile(files, filename){
			var index = -1;
			for (var i = 0; i < files.length; i++){
				if (files[i].name === filename){
					index = i;
					break;
				}
			}

			files.splice(index, 1);

			return index;
		}
	})
})();