(function(){
	angular.module('general').controller('NavController', function($http, AuthService, AuthResolver, $state){
		var vm = this;
		this.$state = $state;
		this.bLoggedIn = null;
		
		if (AuthResolver.bIsResolved()){
			vm.bLoggedIn = AuthService.isAuthenticated();
		}else{
			AuthResolver.resolve().then(function(){
				vm.bLoggedIn = AuthService.isAuthenticated();
			});
		}
	});
})();