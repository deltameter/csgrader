(function(){
	angular.module('general').controller('NavController', function($http, AuthService){
		var root = this;
		this.bLoggedIn = AuthService.isAuthenticated();
	});
})();