(function(){
	angular.module('general')
	.directive('navbar', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/general/partials/navbar.html',
			controller: 'NavController',
			controllerAs: 'navCtrl'
		}
	})
})();