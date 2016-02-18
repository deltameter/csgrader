(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.login', {
			url: '/login',
			templateUrl: '/angular/user/partials/login.html',
			controller: 'LoginController',
			controllerAs: 'loginCtrl'
		});

		$stateProvider.state('root.join', {
			url: '/join',
			templateUrl: '/angular/user/partials/join.html',
			controller: 'JoinController',
			controllerAs: 'joinCtrl'
		});

		$stateProvider.state('root.dashboard', {
			templateUrl: '/angular/user/partials/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('root.profile', {
			url: '/profile',
			templateUrl: '/angular/user/partials/profile.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});
	}]);
})();