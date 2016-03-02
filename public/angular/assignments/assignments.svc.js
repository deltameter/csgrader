(function(){
	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			createAssignment: createAssignment,
			getAssignment: getAssignment,
			addQuestion: addQuestion,
			deleteQuestion: deleteQuestion
		};

		function createAssignment(courseCode, newAssignment){
			return $http.post('/api/course/' + courseCode + '/assignment/create', newAssignment);
		};

		function getAssignment(courseCode, assignmentID){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID).then(
				function Success(res){

					var assignment = res.data;
					var eI = 0, qI = 0;

					assignment.content = new Array(assignment.questions.length + assignment.exercises.length);
					console.log(assignment);
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
							assignment.content[i].questionIndex = qI
							qI++
						}
					}
					return assignment;
				},
				function Failure(res){

				}
			);
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

		function deleteQuestion(courseCode, assignmentID, questionIndex){
			var question = { questionIndex: questionIndex };
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/delete', question);
		}
	})

	.factory('QuestionFactory', function($http){

		return {
			editQuestion: editQuestion
		};

		function editQuestion(courseCode, assignmentID, question){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/edit', question);
		}
	})
})();