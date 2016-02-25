(function(){
	angular.module('assignments')
	.directive('question', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/assignments/partials/question.html'
		}
	});
})();