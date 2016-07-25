(function(){
	angular.module('general').config(function($stateProvider){

		$stateProvider
		.state('root', {
			abstract: true,
			template: '<div ui-view></div>',
			resolve: {
				auth: function resolveAuthentication(AuthResolver) { 
					return (AuthResolver.bIsResolved() === true || AuthResolver.resolve());
				}
			}
		})

		.state('root.main', {
			url: '/',
			template: '<div ui-view></div>',
			data: {
				bIsPublic: true
			},
			controller: function($state, AuthService){
				if (AuthService.isAuthenticated()){
					$state.go('root.main.dashboard');
				}else{
					$state.go('root.main.public');
				}
			}
		})

		.state('root.main.public', {
			templateUrl: '/partials/general/index.html',
			data: {
				bIsPublic: true
			},
			controller: function(){
				console.log('Hit public index');
			}
		});
	});
})();