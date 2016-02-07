(function(){
	angular.module('grader.general').controller('NavController', ['$http', function($http){
		var nav = this;
		nav.bLoggedIn = null;

		$http.get('/user/isAuthenticated').then(function(res){
			nav.bLoggedIn = res.data;
		});
	}]);
})();