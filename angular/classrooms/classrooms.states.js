(function(){
	angular.module('classrooms').config(['$stateProvider', function($stateProvider){
		$stateProvider
		.state('root.classrooms', {
			url: '/course/:courseCode/classroom',
			templateUrl: '/partials/classrooms/classrooms.html',
			controller: 'ClassroomsController',
			controllerAs: 'classroomsCtrl'
		})
		.state('root.classroom', {
			url: '/course/:courseCode/classroom/:classCode',
			templateUrl: '/partials/classrooms/classroom.html',
			controller: 'ClassroomController',
			controllerAs: 'classroomCtrl'
		})
	}]);
})();