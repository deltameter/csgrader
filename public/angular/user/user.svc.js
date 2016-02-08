(function(){
	angular.module('user').factory('userFactory', function(){
		var service = {};

		service.createUser = function(){
			var user = { username: '', password: '' };
			return user;
		}

		return service;
	});

	angular.module('user').service('loginService', ['$http', function($http){
		this.login = function(user){
			return $http.post('/auth/local', user);
		};

		this.join = function(user){
			return $http.post('/join', user);
		};
	}]);
})();