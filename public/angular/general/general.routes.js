(function(){
	angular.module('general').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('index', {
			url: '/',
			resolve: {
				auth: function resolveAuthentication(AuthResolver) { 
					return (AuthResolver.bIsResolved() === true || AuthResolver.resolve());
				}
			},
			controller: function($state, AuthService){
				console.log('controller called');
				console.log('Controller auth: ' + AuthService.isAuthenticated())
				if (AuthService.isAuthenticated()){
					$state.go('dashboard');
				}else{
					$state.go('public');
				}
			}
		});

		$stateProvider.state('public', {
			url: '/',
			templateUrl: '/angular/general/partials/index.general.html'
		});
	}]);
})();