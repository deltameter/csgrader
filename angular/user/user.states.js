(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.login', {
			url: '/login',
			templateUrl: '/partials/user/login.html',
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
			templateUrl: '/partials/user/join.html',
			data: {
				bIsPublic: true
			},
			controller: 'JoinController',
			controllerAs: 'joinCtrl',
		});
		
		$stateProvider.state('root.profile', {
			url: '/profile',
			templateUrl: '/partials/user/profile.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});

	}]);
})();