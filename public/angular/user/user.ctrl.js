(function(){
	angular.module('user').controller('LoginController', function($state, $rootScope, AuthService){
		var vm = this;
		
		vm.authMessage = '';
		vm.user = {
			email: '',
			password: ''
		};

		this.login = function() {
			AuthService.login(vm.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					vm.authMessage = res.data.userMessage;
				});
		};
	});
	
	angular.module('user').controller('JoinController', function($state, $rootScope, AuthService){
		var vm = this;
		vm.authMessage = '';
		vm.user = {
			firstName: '',
			lastName: '',
			retypePassword: '', 
			password: '',
			email: '',
			accountType: ''
		};

		this.signup = function() {
			AuthService.signup(vm.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					vm.authMessage = res.data.userMessage;
				});
		};
	});

	angular.module('user').controller('ProfileController', function($state, UserFactory){
		this.user = UserFactory.getUser();
	});
})();