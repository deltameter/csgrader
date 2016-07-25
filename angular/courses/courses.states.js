(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.main.dashboard', {
			templateUrl: '/partials/courses/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('root.course', {
			url: '/course/:courseCode',
			templateUrl: '/partials/courses/course.html',
			controller: 'CourseController',
			controllerAs: 'courseCtrl'
		});
	}]);
})();