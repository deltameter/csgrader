(function(){
	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			getAssignment: getAssignment,
			createAssignment: createAssignment,
			openAssignment: openAssignment
		};

		function getAssignment(courseCode, assignmentID){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID).then(
				function Success(res){
					var assignment = res.data;
					//exercise index, question index, frq index
					var eI = 0, qI = 0, fI = 0;

					assignment.content = new Array(assignment.questions.length + assignment.exercises.length);

					for (var i = 0; i < assignment.contentOrder.length; i++){
						//true = exercise, false = question
						if (assignment.contentOrder[i] === 'exercise'){
							assignment.content[i] = assignment.exercises[eI];
							assignment.content[i].type = 'exercise';
							assignment.content[i].exerciseIndex = eI
							eI++;
						}else if (assignment.contentOrder[i] === 'question'){
							assignment.content[i] = assignment.questions[qI];
							assignment.content[i].type = 'question';
							assignment.content[i].questionIndex = qI;
							qI++;

							if (assignment.content[i].questionType === 'frq'){
								assignment.content[i].frqIndex = fI;
								fI++
							}
						}
					}
					return assignment;
				},
				function Failure(res){

				}
			);
		};

		function createAssignment(courseCode, newAssignment){
			return $http.post('/api/course/' + courseCode + '/assignment/create', newAssignment).then(
				function Success(res){
					return res.data;
				}
			);
		};

		function openAssignment(courseCode, assignmentID, openInfo){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/open', openInfo).then(
				function Success(res){
					return res.data;
				}
			);
		}
	})

	.factory('QuestionFactory', function($http){

		return {
			addQuestion: addQuestion,
			editQuestion: editQuestion,
			deleteQuestion: deleteQuestion
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
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/edit', question);
		}

		function deleteQuestion(courseCode, assignmentID, questionIndex){
			var question = { questionIndex: questionIndex };
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/delete', question);
		}
	})

	.factory('ExerciseFactory', function($http){
		return {
			addExercise: addExercise,
			editExercise: editExercise, 
			testExercise: testExercise,
			deleteExercise: deleteExercise
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
				exerciseIndex: exercise.exerciseIndex, 
				context: exercise.context,
				code: exercise.code,
				triesAllowed: 'unlimited'
			}

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/edit', exercise);
		}

		function testExercise(courseCode, assignmentID, exercise){
			var exerciseTest = {
				exerciseIndex: exercise.exerciseIndex,
				code: exercise.code
			}

			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/test', exerciseTest);

		}

		function deleteExercise(courseCode, assignmentID, exerciseIndex){
			var exercise = { exerciseIndex: exerciseIndex };
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/delete', exercise);
		}
	})
})();