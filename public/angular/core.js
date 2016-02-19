(function(){
	var app = angular.module('grader', 
		[
			'ui.router',
			'general',
			'courses',
			'user'
		]);

	//remove the hash
	app.config(['$locationProvider', function($locationProvider){
		$locationProvider.html5Mode(true);
	}]);
	
	app.run(function ($rootScope, AuthService, AuthResolver) {
  		$rootScope.$on('$stateChangeStart', function (event, next) {
  			if (AuthResolver.bIsResolved()){
  				console.log('stateChangeStart resolved');
  				console.log('auth: ' + AuthService.isAuthenticated());
  			}else{
  				AuthResolver.resolve().then(function(data){
  					console.log('stateChangeStart not resolved');
  					console.log('auth: ' + AuthService.isAuthenticated());
  				})
  			}
  		});
	})

})();