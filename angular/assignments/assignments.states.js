(function(){
	angular.module('assignments').config(['$stateProvider', function($stateProvider){
		$stateProvider

		.state('root.assignments', {
			url: '/course/:courseCode/assignment',
			templateUrl: '/partials/assignments/assignments.html',
			controller: 'AssignmentsController',
			controllerAs: 'assignmentsCtrl'
		})

		.state('root.assignment', {
			url: '/course/:courseCode/assignment/:assignmentID',
			templateUrl: '/partials/assignments/assignment.html',
			controller: 'AssignmentController',
			controllerAs: 'assignmentCtrl'
		})
	}]);
})();