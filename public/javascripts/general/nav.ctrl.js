(function(){
	angular.module('grader.general').controller('NavController', ['$scope', '$http', function($scope, $http){
		$scope.bLoggedIn = null;

		$http.get('/user/isAuthenticated').then(function(res){
			$scope.bLoggedIn = res.data;
		});
	}]);
})();