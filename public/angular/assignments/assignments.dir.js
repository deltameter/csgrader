(function(){
	angular.module('assignments')
	.directive('question', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/assignments/partials/question.html',
			controller: 'QuestionController',
			controllerAs: 'questionCtrl'
		}
	})
	.directive('questionEdit', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/assignments/partials/questionEdit.html',
			controller: 'QuestionEditController',
			controllerAs: 'questionEditCtrl'
		}
	})
	.directive('exercise', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/assignments/partials/exercise.html',
			controller: 'ExerciseController',
			controllerAs: 'exerciseCtrl'
		}
	})
	.directive('exerciseEdit', function(){
		return {
			restrict: 'E',
			templateUrl: '/angular/assignments/partials/exerciseEdit.html',
			controller: 'ExerciseEditController',
			controllerAs: 'exerciseEditCtrl'
		}
	})
})();