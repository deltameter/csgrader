(function(){
	angular.module('assignments')

	.controller('AssignmentController', 
		function($scope, $stateParams, UserInfo, AssignmentFactory, QuestionFactory, ExerciseFactory){

		var vm = this;
		vm.user = UserInfo.getUser();
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		vm.assignment = {};

		var getAssignment = function(){
 			AssignmentFactory.getAssignment(vm.courseCode, vm.assignmentID).then(
				function Success(assignment){
					vm.assignment = assignment;
				},
				function Failure(err){

				}
			);
		}

		this.addQuestion = function(){
			QuestionFactory.addQuestion(vm.courseCode, vm.assignmentID).then(
				function Success(newQuestion){
					newQuestion.questionIndex = vm.assignment.questions.length;
					vm.assignment.content.push(newQuestion);
					vm.assignment.questions.push(newQuestion);
				}
			);
		}
		
		this.deleteQuestion = function(contentIndex, questionIndex){
			QuestionFactory.deleteQuestion(vm.courseCode, vm.assignmentID, questionIndex).then(
				function Success(){
					vm.assignment.content.splice(contentIndex, 1);
					vm.assignment.questions.splice(questionIndex, 1);
					$scope.$broadcast('QUESTION_DELETE', questionIndex);
				}
			);
		}

		this.addExercise = function(){
			ExerciseFactory.addExercise(vm.courseCode, vm.assignmentID).then(
				function Success(newExercise){
					newExercise.exerciseIndex = vm.assignment.exercises.length;
					vm.assignment.content.push(newExercise);
					vm.assignment.exercises.push(newExercise);
				}
			);
		}

		this.deleteExercise = function(contentIndex, exerciseIndex){
			ExerciseFactory.deleteExercise(vm.courseCode, vm.assignmentID, exerciseIndex).then(
				function Success(){
					vm.assignment.content.splice(contentIndex, 1);
					vm.assignment.exercises.splice(exerciseIndex, 1);
					$scope.$broadcast('EXERCISE_DELETE', exerciseIndex);
				}
			);
		}

		getAssignment();
	})

	.controller('QuestionController', function($scope, UserInfo){
		var vm = this;

		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;
		
		this.logQuestion = function(){
			console.log(vm.question);
		}
	})

	.controller('QuestionEditController', function($scope, $stateParams, UserInfo, QuestionFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		
		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;

		$scope.$on('QUESTION_DELETE', function(event, questionIndex){
			if (vm.question.questionIndex > questionIndex){
				vm.question.questionIndex--;
			}
		});

		this.editQuestion = function(){
			if ($scope.editForm.$dirty){
				QuestionFactory.editQuestion(vm.courseCode, vm.assignmentID, vm.question).then(
					function Success(res){
						$scope.editing = false;
					}
				)
			}else{
				$scope.editing = false;
			}
		}

		this.addFillAnswer = function(){
			vm.question.fillAnswers.push('');
		}

		this.deleteFillAnswer = function(index){
			vm.question.fillAnswers.splice(index, 1);
		}

		this.addMCOption = function(){
			vm.question.answerOptions.push('');
		}

		this.deleteMCOption = function(index){
			vm.question.answerOptions.splice(index, 1);
		}
	})

	.controller('ExerciseController', function($scope, $stateParams, Config, UserInfo, ExerciseFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		vm.editing = false;
		//get the exercise contents from the parent scope
		vm.exercise = $scope.$parent.content;
		//this object is resolved in the onload option
		vm.aceEditor = {};
		//info we get after every compilation (output/errors)
		vm.compilationInfo = {};
		//select which file to run. Defaults at the file with the unit tests. 
		vm.currentFile = 'Main';

		$scope.$on('EXERCISE_DELETE', function(event, exerciseIndex){
			if (vm.exercise.exerciseIndex > exerciseIndex){
				vm.exercise.exerciseIndex--;
			}
		});

		//configure ace
		vm.aceOptions = {
			//workerPath: '/bower_components/ace-builds/src-min-noconflict/',
			//mode: 'java',
			onLoad: function(aceEditor) {
				//Get the ace editor in our 
			    aceEditor.setReadOnly(true);
			    aceEditor.$blockScrolling = Infinity;

			    vm.aceEditor = aceEditor;
			}
		}

		this.toggleEdit = function(){
			vm.editing = !vm.editing;
			vm.aceEditor.setReadOnly(!vm.aceEditor.$readOnly);
		}

		this.resetExercise = function(){
			vm.compilationInfo = {};
		}

		this.addFile = function(){
			if (typeof vm.newFileName === 'undefined' || vm.newFileName.length === 0){
				return;
			}
			vm.newFileName = vm.newFileName.split('.')[0];
			vm.exercise.code[vm.newFileName] = '';
			vm.newFileName = '';
		}

		this.deleteFile = function(){
			if (vm.currentFile === Config.graderTestFile){
				return;
			}
			
			var files = Object.keys(vm.exercise.code);
			var nextFile;

			for (var i = 0; i < files.length; i++){
				if (files[i] === vm.currentFile){
					nextFile = files[Math.max(0, i - 1)];
				}
			}

			delete vm.exercise.code[vm.currentFile];
			vm.currentFile = nextFile;
		}

		this.editExercise = function(){
			ExerciseFactory.editExercise(vm.courseCode, vm.assignmentID, vm.exercise).then(
				function Success(res){
					vm.toggleEdit();
				}
			)
		}

		this.testExercise = function(){
			ExerciseFactory.testExercise(vm.courseCode, vm.assignmentID, vm.exercise).then(
				function Success(res){
					vm.compilationInfo.output = res.data.output;
					vm.compilationInfo.errors = res.data.errors;
				}
			)
		}
	})

/*	.controller('ExerciseEditController', function($scope, $stateParams, UserInfo, ExerciseFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		
		//get the exercise contents from the parent scope
		vm.exercise = $scope.$parent.content;

		//configure ace
		vm.aceOptions = {
			//workerPath: '/bower_components/ace-builds/src-min-noconflict/',
			//mode: 'java',
			onLoad: function(ace) {
			    ace.$blockScrolling = Infinity; 
			}
		}
	})*/
})();