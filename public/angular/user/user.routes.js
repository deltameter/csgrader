(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('login', {
			url: '/login',
			templateUrl: '/angular/user/partials/auth.user.html',
			controller: 'LoginController',
			controllerAs: 'loginCtrl'
		});

		$stateProvider.state('dashboard', {
			url: '',
			templateUrl: '/angular/user/partials/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('profile', {
			url: '/profile',
			templateUrl: '/angular/user/partials/profile.user.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});
	}]);
})();