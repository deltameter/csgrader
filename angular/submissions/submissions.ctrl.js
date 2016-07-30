(function(){
	'use strict';
	angular.module('submissions')

	.controller('SubmissionsController', function($stateParams, SubmissionsFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		var init = function(){
			SubmissionsFactory.setParams(vm.courseCode, $stateParams.assignmentID);

			SubmissionsFactory.getClassesWithProgress().then(function(classrooms){
				vm.classrooms = classrooms;
			});
		}

		this.getSubmissions = function(classCode){
			SubmissionsFactory.getSubmissions(classCode).then(function(data){
				vm.currentClassroom = classCode;
				vm.submissions = data.submissions;
				vm.assignment = data.assignment;
			});
		}

		init();
	})

	.controller('SubmissionController', function($stateParams, $timeout, AssignmentFactory, SubmissionFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		vm.submissionID = $stateParams.submissionID;
		vm.bBackendComputing = false;

		var init = function(){
			SubmissionFactory.setParams(vm.courseCode, vm.assignmentID, vm.submissionID);

			AssignmentFactory.getAssignmentToGrade(vm.courseCode, vm.assignmentID, vm.submissionID).then(function(assignment){
				vm.assignment = assignment;
			});
		}

		this.saveComment = function(contentType, contentID, text){
			vm.bBackendComputing = true;
			SubmissionFactory.saveComment(contentType, contentID, text).then(function(res){
				$timeout(function(){
					vm.bBackendComputing = false;
				}, 200)
			});
		}

		this.gradeContent = function(contentType, contentIndex, points){
			SubmissionFactory.gradeContent(contentType, contentIndex, points);
		}

		init();
	})
})();