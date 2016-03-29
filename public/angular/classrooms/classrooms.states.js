(function(){
	angular.module('classrooms').config(['$stateProvider', function($stateProvider){
		$stateProvider
		.state('root.classrooms', {
			url: '/course/:courseCode/classroom',
			templateUrl: '/angular/classrooms/partials/classrooms.html',
			controller: 'ClassroomsController',
			controllerAs: 'classroomsCtrl'
		})
		.state('root.classroom', {
			url: '/course/:courseCode/classroom/:classCode',
			templateUrl: '/angular/classrooms/partials/classroom.html',
			controller: 'ClassroomController',
			controllerAs: 'classroomCtrl'
		})
	}]);
})();