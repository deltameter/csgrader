(function(){
	function arrayObjectIndexOf(myArray, property, searchTerm) {
		for(var i = 0, len = myArray.length; i < len; i++) {
			if (myArray[i][property] === searchTerm) return i;
		}
		return -1;
	}

	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			getAssignment: getAssignment,
			getAll: getAll,
			search: search,
			createAssignment: createAssignment,
			openAssignment: openAssignment,
			closeAssignment: closeAssignment
		};

		function getAssignment(courseCode, assignmentID){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID).then(
				function Success(res){
					var assignment = res.data.assignment;
					assignment.content = new Array(assignment.questions.length + assignment.exercises.length);

					for (var i = 0; i < assignment.contentOrder.length; i++){
						//true = exercise, false = question
						//content order is the type of problem, then the ID of said problem
						if (assignment.contentOrder[i].indexOf('exercise') === 0){
							//get the id by removing exercise from the thing
							var id = assignment.contentOrder[i].split('exercise')[1];
							var location = arrayObjectIndexOf(assignment.exercises, '_id', id);

							assignment.content[i] = assignment.exercises[location];
							assignment.content[i].type = 'exercise';
							assignment.content[i].exerciseIndex = location;

						}else if (assignment.contentOrder[i].indexOf('question') === 0){
							//get the id by removing question from the thing
							var id = assignment.contentOrder[i].split('question')[1];
							var location = arrayObjectIndexOf(assignment.questions, '_id', id);

							assignment.content[i] = assignment.questions[location];
							assignment.content[i].type = 'question';
							assignment.content[i].questionIndex = location;
						}
					}

					//if a submission is included, load it. This means either a student is loading this,
					//or a teacher/aide is viewing a student submission
					if (res.data.submission){
						var submission = res.data.submission;

						for (var i = 0; i < assignment.questions.length; i++){
							assignment.questions[i].studentAnswer = submission.questionAnswers[i];
							assignment.questions[i].tries = submission.questionTries[i];
							assignment.questions[i].pointsEarned = submission.questionPoints[i];
							assignment.questions[i].bIsCorrect = submission.questionsCorrect[i];
						}

						for (var i = 0; i < assignment.exercises.length; i++){
							assignment.exercises[i].code = submission.exerciseAnswers[i];
							assignment.exercises[i].tries = submission.exerciseTries[i];
							assignment.exercises[i].pointsEarned = submission.exercisePoints[i];
							assignment.exercises[i].bIsCorrect = submission.exercisesCorrect[i];
						}
					}
					return assignment;
				},
				function Failure(res){
					console.log(res);
				}
			);
		};

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

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/submit', answer);
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

		function submitExercise(courseCode, assignmentID, exerciseIndex, code){
			var submission = {
				exerciseIndex: exerciseIndex,
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

			//if there is no other file with the same name
			if (exercise.code.map(function(code){ return code.name }).indexOf(filename) === -1 
				&& exercise.tests.map(function(test){ return test.name }).indexOf(filename) === -1){
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