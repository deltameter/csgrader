(function(){
	var app = angular.module('grader', 
		[
			'ui.router',
			'general',
			'user'
		]);

	//remove the hash
	app.config(['$locationProvider', function($locationProvider){
		$locationProvider.html5Mode(true);
	}]);
	
	app.run(function ($rootScope, AuthService) {
  		$rootScope.$on('$stateChangeStart', function (event, next) {
  			console.log('auth: ' + AuthService.isAuthenticated());
  		});
	})

})();