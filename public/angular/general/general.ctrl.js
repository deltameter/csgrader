(function(){
	angular.module('general').controller('NavController', function($rootScope, $scope, $http, AuthService, AuthResolver, $state){
		var vm = this;
		vm.$state = $state;
		vm.bLoggedIn = null;

		var checkAuth = function(){
			if (AuthResolver.bIsResolved()){
				vm.bLoggedIn = AuthService.isAuthenticated();
			}else{
				AuthResolver.resolve().then(function(){
					vm.bLoggedIn = AuthService.isAuthenticated();
				});
			}
		}

		//When the user logs in, change to logged in nav bar
		$rootScope.$watch('currentUser', function(){
			checkAuth();
		});

		checkAuth();
	});
})();