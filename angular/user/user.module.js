(function(){
	var app = angular.module('user', [])
	.run(function($http, AuthService){
		AuthService.retrieveProfile();
	});
})();