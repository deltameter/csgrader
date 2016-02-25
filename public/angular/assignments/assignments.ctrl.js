(function(){
	angular.module('assignments').controller('AssignmentController', function($stateParams, UserFactory, AssignmentFactory){
		var vm = this;
		vm.user = UserFactory.getUser();
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		vm.assignment = {};
		vm.question = {};

		vm.memes = 1;

		var getAssignment = function(){
 			AssignmentFactory.getAssignment(vm.courseCode, vm.assignmentID).then(
				function Success(assignment){
					vm.assignment = assignment;
				},
				function Failure(err){

				}
			)
		}

		this.contentTracker = function(n){
			console.log(n);
		}

		this.addQuestion = function(){
			AssignmentFactory.addQuestion(vm.courseCode, vm.assignmentID).then(
				function Success(res){
					console.log(res.data)
				},
				function Failure(res){

				}
			)
		}

		this.editQuestion = function(question){
			question.questionIndex = 0;
			AssignmentFactory.editQuestion(vm.courseCode, vm.assignmentID, question).then(
				function Success(res){
					console.log(res);
				},
				function Failure(res){
					console.log(res);
				}
			)
		}

		getAssignment();
	});
})();