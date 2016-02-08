(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('login', {
			url: '/login',
			templateUrl: '/angular/user/auth.user.html',
			controller: 'LoginController',
			controllerAs: 'loginCtrl'
		});

		$stateProvider.state('dashboard', {
			url: '',
			templateUrl: '/angular/user/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('profile', {
			url: '/profile',
			templateUrl: '/angular/user/profile.user.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});
	}]);
})();