(function(){
	angular.module('general').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('index', {
			url: '/',
			resolve: {
				auth: function resolveAuthentication(AuthResolver) { 
					return AuthResolver.resolve();
				}
			},
			controller: function($state, AuthService){
				if (AuthService.isAuthenticated()){
					$state.go('dashboard');
				}else{
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