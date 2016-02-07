(function(){
	angular.module('user').factory('userFactory', function(){
		var service = {};

		service.createUser = function(){
			var user = { username: '', password: '' };
			return user;
		}

		return service;
	});

	angular.module('user').controller('LoginController', ['$http', function($http, userFactory){
		this.user = userFactory.createUser();
		var user = this.user;
		
		this.login = function(){
			console.log(user);
			$http.post('/auth/local', user).then(
			function(res){
				console.log(res);
			}
			, function(res){
				console.log(res);
			});
		}
	}]);
})();