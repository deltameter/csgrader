(function(){
	angular.module('submissions')

	.controller('SubmissionsController', function($state, $stateParams, SubmissionsFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		vm.submissionID = $stateParams.submissionID;

		var init = function(){
			SubmissionsFactory.setParams($stateParams.courseCode, $stateParams.assignmentID);

			SubmissionsFactory.getClassesWithProgress().then(function(classrooms){
				vm.classrooms = classrooms;
			});
		}

		this.getSubmissions = function(classCode){
			SubmissionsFactory.getSubmissions(classCode).then(function(data){
				console.log(data);
				vm.submissions = data.submissions;
				vm.assignment = data.assignment;
			});
		}

		init();
	})
})();