(function(){
	'use strict';
	angular.module('submissions').config(['$stateProvider', function($stateProvider){
		$stateProvider
		
		.state('root.submissions', {
			url: '/course/:courseCode/assignment/:assignmentID/submission',
			templateUrl: '/partials/submissions/submissions.html',
			controller: 'SubmissionsController',
			controllerAs: 'submissionsCtrl'
		})

		.state('root.submission', {
			url: '/course/:courseCode/assignment/:assignmentID/submission/:submissionID',
			templateUrl: '/partials/submissions/submission.html',
			controller: 'SubmissionController',
			controllerAs: 'submissionCtrl'
		})

	}]);
})();