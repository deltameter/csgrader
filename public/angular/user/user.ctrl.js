(function(){

	angular.module('user').controller('LoginController', function($state, $rootScope, AuthService){
		var root = this;
		this.authMessage = '';
		this.user = {
			username: '',
			password: ''
		};

		this.login = function() {
			AuthService.login(root.user).then(
				function(res){
					$state.go('root.profile');
				},
				function(res){
					root.authMessage = res.data.userMessage;
				});
		};
	});
	
	angular.module('user').controller('DashboardController', function($state, Session){
		this.user = Session.user;
	});

	angular.module('user').controller('ProfileController', function($state, Session){
		this.user = Session.user;
	});
})();