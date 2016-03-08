(function(){
	angular.module('assignments')

	.controller('AssignmentController', function($scope, $stateParams, UserInfo, AssignmentFactory){
		var vm = this;
		vm.user = UserInfo.getUser();
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
					$scope.$broadcast('QUESTION_DELETE', questionIndex);
				},
				function Failure(res){

				}
			)
		}

		getAssignment();
	})

	.controller('QuestionController', function(UserInfo){
		var vm = this;

		//question is instantiated through the ng-init
		vm.question = {};
		
		this.logQuestion = function(){
			console.log(vm.question);
		}
	})

	.controller('QuestionEditController', function($scope, $stateParams, UserInfo, QuestionFactory){
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

		this.editQuestion = function(bHasEdited){
			if (bHasEdited){
				QuestionFactory.editQuestion(vm.courseCode, vm.assignmentID, vm.question).then(
					function Success(res){
						$scope.editing = false;
					}
				)
			}else{
				$scope.editing = false;
			}
		}

		this.addFillAnswer = function(){
			vm.question.fillAnswers.push('');
		}

		this.deleteFillAnswer = function(index){
			vm.question.fillAnswers.splice(index, 1);
		}

		this.addMCOption = function(){
			vm.question.answerOptions.push('');
		}

		this.deleteMCOption = function(index){
			vm.question.answerOptions.splice(index, 1);
		}
	})
})();