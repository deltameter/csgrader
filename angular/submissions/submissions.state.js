(function(){
	angular.module('submissions').config(['$stateProvider', function($stateProvider){
		$stateProvider
		
		.state('root.submissions', {
			url: '/course/:courseCode/assignment/:assignmentID/submission',
			templateUrl: '/partials/submissions/submissions.html',
			controller: 'SubmissionsController',
			controllerAs: 'submissionsCtrl'
		})
	}]);
})();