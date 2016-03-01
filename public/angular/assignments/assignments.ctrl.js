(function(){
	angular.module('assignments')

	.controller('AssignmentController', function($scope, $stateParams, UserFactory, AssignmentFactory){
		var vm = this;
		vm.user = UserFactory.getUser();
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		vm.assignment = {};

		var getAssignment = function(){
 			AssignmentFactory.getAssignment(vm.courseCode, vm.assignmentID).then(
				function Success(assignment){
					vm.assignment = assignment;
				},
				function Failure(err){

				}
			)
		}

		this.addQuestion = function(){
			AssignmentFactory.addQuestion(vm.courseCode, vm.assignmentID).then(
				function Success(newQuestion){
					newQuestion.questionIndex = vm.assignment.questions.length;
					vm.assignment.content.push(newQuestion);
					vm.assignment.questions.push(newQuestion);
				},
				function Failure(res){

				}
			)
		}
		
		this.deleteQuestion = function(questionIndex){
			AssignmentFactory.deleteQuestion(vm.courseCode, vm.assignmentID, questionIndex).then(
				function Success(newQuestion){
					vm.assignment.content.splice(questionIndex, 1);
					$scope.$broadcast('QUESTION_DELETE', 1);
				},
				function Failure(res){

				}
			)
		}

		getAssignment();
	})

	.controller('QuestionController', function(UserFactory){
		var vm = this;

		//question is instantiated through the ng-init
		vm.question = {};
		
		this.logQuestion = function(){
			console.log(vm.question);
		}
	})

	.controller('QuestionEditController', function($scope, $stateParams, UserFactory, QuestionFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		
		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;

		$scope.$on('QUESTION_DELETE', function(event, questionIndex){
			if (vm.question.questionIndex > questionIndex){
				vm.question.questionIndex--;
			}
		});

		this.editQuestion = function(){
			QuestionFactory.editQuestion(vm.courseCode, vm.assignmentID, vm.question).then(
				function Success(res){
					console.log(res);
				},
				function Failure(res){
					console.log(res);
				}
			)
		}
	})

})();