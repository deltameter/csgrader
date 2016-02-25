(function(){
	angular.module('assignments').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.assignment', {
			url: '/course/:courseCode/assignment/:assignmentID',
			templateUrl: '/angular/assignments/partials/assignment.html',
			controller: 'AssignmentController',
			controllerAs: 'assignmentCtrl'
		});
	}]);
})();