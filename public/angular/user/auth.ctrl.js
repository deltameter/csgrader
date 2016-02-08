(function(){
	angular.module('user').controller('loginController', 
			[ '$state', 'loginService', 'userFactory', 
			function($state, loginService, userFactory){

		this.user = userFactory.createUser();
		this.authMessage = '';

		var root = this;

		this.login = function(){
			loginService.login(root.user).then(
				function(res){
					console.log('success');
				},
				function(res){
					console.log('failure');
					root.authMessage = res.data.userMessage;
				}
			)
		};
	}]);
})();