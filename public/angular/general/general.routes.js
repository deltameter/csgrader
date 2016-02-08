(function(){
	angular.module('general').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('index', {
			url: '/',
			resolve: {
				auth: function resolveAuthentication(AuthResolver) { 
					console.log('hi');
					return AuthResolver.resolve();
				}
			},
			controller: function($state, AuthService){
				if (AuthService.isAuthenticated()){
					console.log('ath')
					$state.go('dashboard');
				}else{
					console.log('nit auth')
					$state.go('public');
				}
			}
		});

		$stateProvider.state('public', {
			url: '/',
			templateUrl: '/angular/general/index.general.html'
		});
	}]);
})();