(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('login', {
			url: '/login',
			templateUrl: '/angular/user/auth.user.html',
			controller: 'loginController',
			controllerAs: 'loginCtrl'
		});
	}]);
})();