(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.login', {
			url: '/login',
			templateUrl: '/angular/user/partials/login.html',
			data: {
				bIsPublic: true
			},
			controller: 'LoginController',
			controllerAs: 'loginCtrl'
		});

		$stateProvider.state('root.logout', {
			url: '/logout',
			controller: 'LogoutController'
		});

		$stateProvider.state('root.join', {
			url: '/join',
			templateUrl: '/angular/user/partials/join.html',
			data: {
				bIsPublic: true
			},
			controller: 'JoinController',
			controllerAs: 'joinCtrl',
		});
		
		$stateProvider.state('root.profile', {
			url: '/profile',
			templateUrl: '/angular/user/partials/profile.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});

	}]);
})();