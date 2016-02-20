(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.main.dashboard', {
			templateUrl: '/angular/courses/partials/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('root.course', {
			url: '/course/:courseCode',
			templateUrl: '/angular/courses/partials/course.html',
			controller: 'CourseController',
			controllerAs: 'courseCtrl'
		});
	}]);
})();