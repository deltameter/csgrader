(function(){
	angular.module('assignments')
	.directive('question', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/assignments/question.html',
			controller: 'QuestionController',
			controllerAs: 'questionCtrl'
		}
	})
	.directive('questionEdit', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/assignments/questionEdit.html',
			controller: 'QuestionEditController',
			controllerAs: 'questionEditCtrl'
		}
	})
	.directive('exercise', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/assignments/exercise.html',
			controller: 'ExerciseController',
			controllerAs: 'exerciseCtrl'
		}
	})
	.directive('exerciseEdit', function(){
		return {
			restrict: 'E',
			templateUrl: '/partials/assignments/exerciseEdit.html',
			controller: 'ExerciseEditController',
			controllerAs: 'exerciseEditCtrl'
		}
	})
})();