(function(){
	angular.module('user').controller('LoginController', function($state, $rootScope, AuthService){
		var root = this;
		this.authMessage = '';
		this.user = {
			email: '',
			password: ''
		};

		this.login = function() {
			AuthService.login(root.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					root.authMessage = res.data.userMessage;
				});
		};
	});
	
	angular.module('user').controller('JoinController', function($state, $rootScope, AuthService){
		var root = this;
		this.authMessage = '';
		this.user = {
			firstName: '',
			lastName: '',
			retypePassword: '', 
			password: '',
			email: '',
			accountType: ''
		};

		this.signup = function() {
			AuthService.signup(root.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					root.authMessage = res.data.userMessage;
				});
		};
	});

	angular.module('user').controller('ProfileController', function($state, Session){
		this.user = Session.user;
	});
})();