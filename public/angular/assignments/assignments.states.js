(function(){
	angular.module('assignments').config(['$stateProvider', function($stateProvider){
		$stateProvider

		.state('root.assignments', {
			url: '/course/:courseCode/assignment',
			templateUrl: '/angular/assignments/partials/assignments.html',
			controller: 'AssignmentsController',
			controllerAs: 'assignmentsCtrl'
		})

		.state('root.assignment', {
			url: '/course/:courseCode/assignment/:assignmentID',
			templateUrl: '/angular/assignments/partials/assignment.html',
			controller: 'AssignmentController',
			controllerAs: 'assignmentCtrl'
		})
	}]);
})();