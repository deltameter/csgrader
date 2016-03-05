(function(){
	angular.module('general').controller('NavController', function($rootScope, $scope, $http, AuthService, AuthResolver, $state){
		var vm = this;
		vm.$state = $state;
		vm.bLoggedIn = null;
		vm.homeState = 'root.main.dashboard';

		console.log($rootScope);

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

		//Go to a different state based on auth status
		$scope.$watch('navCtrl.bLoggedIn', function(bLoggedIn){
			if (bLoggedIn){
				vm.homeState = 'root.main.dashboard';
			}else{
				vm.homeState = 'root.main.public';
			}
		});

		checkAuth();
	});
})();