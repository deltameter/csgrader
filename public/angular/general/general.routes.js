(function(){
	angular.module('general').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('index', {
			url: '/',
			templateUrl: '/angular/general/index.general.html'
		});
	}]);
})();