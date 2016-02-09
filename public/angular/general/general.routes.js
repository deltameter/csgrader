(function(){
	angular.module('general').config(function($stateProvider){

		$stateProvider
		.state('root', {
			abstract: true,
			template: '<ui-view/>',
			resolve: {
				auth: function resolveAuthentication(AuthResolver) { 
					return (AuthResolver.bIsResolved() === true || AuthResolver.resolve());
				}
			}
		})

		.state('root.main', {
			url: '/',
			template: '<ui-view/>',
			controller: function($state, AuthService){
				if (AuthService.isAuthenticated()){
					$state.go('root.dashboard');
				}else{
					$state.go('root.main.public');
				}
			}
		})

		.state('root.main.public', {
			templateUrl: '/angular/general/partials/index.general.html'
		});

	});
})();