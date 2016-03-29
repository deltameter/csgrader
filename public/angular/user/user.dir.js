(function(){
	angular.module('user')
	.directive('registration', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/user/partials/registration.html',
			controller: 'RegistrationController',
			controllerAs: 'registrationCtrl'
		}
	})
})();