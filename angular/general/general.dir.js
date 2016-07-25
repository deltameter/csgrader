(function(){
	angular.module('general')
	.directive('navbar', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/general/navbar.html',
			controller: 'NavController',
			controllerAs: 'navCtrl'
		}
	})
})();