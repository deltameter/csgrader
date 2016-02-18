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
				console.log('hi');
				if (AuthService.isAuthenticated()){
					$state.go('root.dashboard');
				}else{
					$state.go('root.public');
				}
			}
		})

		.state('root.public', {
			templateUrl: '/angular/general/partials/index.html'
		});

	});
})();