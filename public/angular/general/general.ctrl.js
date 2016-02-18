(function(){
	angular.module('general').controller('NavController', function($http, AuthService, AuthResolver, $state){
		var root = this;
		this.$state = $state;
		this.bLoggedIn = null;
		
		if (AuthResolver.bIsResolved()){
			root.bLoggedIn = AuthService.isAuthenticated();
		}else{
			AuthResolver.resolve().then(function(){
				root.bLoggedIn = AuthService.isAuthenticated();
			});
		}
	});
})();