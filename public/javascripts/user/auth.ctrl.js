(function(){
	angular.module('grader.user').controller('LoginController', ['$http', function($http){
		var user = this;
		user.bLoggedIn = null;

		$http.get('/user/isAuthenticated').then(function(res){
			user.bLoggedIn = res.data;
		});
	}]);
})();