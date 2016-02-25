(function(){
	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			createAssignment: createAssignment,
			getAssignment: getAssignment,
			addQuestion: addQuestion,
			editQuestion: editQuestion
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

					for (var i = 0; i < assignment.contentOrder.length; i++){
						//true = exercise, false = question
						if (assignment.contentOrder[i]){
							assignment.content[i] = assignment.exercises[eI];
							assignment.content[i].type = 'exercise';
							eI++;
						}else{
							assignment.content[i] = assignment.questions[qI];
							assignment.content[i].type = 'question';
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
			return $http.post('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/create');
		}

		function editQuestion(courseCode, assignmentID, question){
			return $http.put('/api/course/' + courseCode + '/assignment/' + assignmentID + '/question/edit', question);
		}
	});
})();