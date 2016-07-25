(function(){
	angular.module('user')
	.directive('registration', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/user/registration.html',
			controller: 'RegistrationController',
			controllerAs: 'registrationCtrl'
		}
	})
})();