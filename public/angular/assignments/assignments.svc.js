(function(){
	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			getAssignment: getAssignment,
			getSubmission: getSubmission,
			createAssignment: createAssignment,
			openAssignment: openAssignment
		};

		function getAssignment(courseCode, assignmentID){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID).then(
				function Success(res){
					var assignment = res.data;
					//exercise index, question index, frq index
					var eI = 0, qI = 0;

					assignment.content = new Array(assignment.questions.length + assignment.exercises.length);

					for (var i = 0; i < assignment.contentOrder.length; i++){
						//true = exercise, false = question
						if (assignment.contentOrder[i] === 'exercise'){
							console.log(assignment.exercises[eI])
							assignment.content[i] = assignment.exercises[eI];
							assignment.content[i].type = 'exercise';
							assignment.content[i].exerciseIndex = eI
							eI++;
						}else if (assignment.contentOrder[i] === 'question'){
							assignment.content[i] = assignment.questions[qI];
							assignment.content[i].type = 'question';
							assignment.content[i].questionIndex = qI;
							qI++;
						}
					}
					return assignment;
				},
				function Failure(res){

				}
			);
		};

		function getSubmission(courseCode, assignmentID, assignment){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission').then(
				function Success(res){
					var submission = res.data;

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

					return submission;
				},
				function Failure(res){

				}
			)
		}

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
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/edit', question);
		}

		function deleteQuestion(courseCode, assignmentID, questionIndex){
			var question = { questionIndex: questionIndex };
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/delete', question);
		}

		function submitQuestion(courseCode, assignmentID, answer){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/submit', answer);
		}
	})

	.factory('ExerciseFactory', function($http){
		return {
			addExercise: addExercise,
			editExercise: editExercise, 
			testExercise: testExercise,
			submitExercise: submitExercise,
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
				triesAllowed: exercise.triesAllowed,
				pointsWorth: exercise.pointsWorth
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

		function submitExercise(courseCode, assignmentID, exercise){
			var submission = {
				exerciseIndex: exercise.exerciseIndex,
				code: exercise.code
			}

			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/submit', submission);
		}

		function deleteExercise(courseCode, assignmentID, exerciseIndex){
			var exercise = { exerciseIndex: exerciseIndex };
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/exercise/delete', exercise);
		}
	})
})();