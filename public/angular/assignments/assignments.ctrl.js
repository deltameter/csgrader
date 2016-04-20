(function(){
	angular.module('assignments')

	.controller('AssignmentsController', function($scope, $stateParams, $state, AssignmentFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.searchAssignments = [];

		//# of assignments shown at one time in the assignments thing
		vm.assignmentsShownLength = 5;
		//current page
		vm.listPage = 0;
		//this is set whenever user asks for list of assignments. min page num is obvs 0
		vm.maxListPage = 0;

		vm.currentListAssignments = [];
		vm.listAssignments = [];

		//'search' or 'all'
		vm.currentFindType = 'search';

		//Used to keep a set number of search assignments/list assignments
		$scope.range = function(num){
			var arr = []; 

			for (var i = 0; i < num; i++) { 
				arr.push(i) 
			} 

			return arr;
		}

		this.createAssignment = function(){
			AssignmentFactory.createAssignment(vm.courseCode, vm.newAssignment).then(
				function Success(assignment){
					$state.go('root.assignment', { courseCode: vm.courseCode, assignmentID: assignment.assignmentID });
				}, 
				function Failure(userMessage){
					vm.userMessageCreate = userMessage;
				}
			);
		}

		this.search = function(){
			//set this to null so it blinks and users know its searching if their next search returns the same results
			vm.searchAssignments = [];

			AssignmentFactory.search(vm.courseCode, vm.searchTerms).then(
				function Success(assignments){
					vm.currentFindType = 'search';
					vm.searchAssignments = assignments;
				}
			)
		}

		this.getAll = function(){
			AssignmentFactory.getAll(vm.courseCode).then(
				function Success(assignments){
					vm.currentFindType = 'all';
					vm.listAssignments = assignments;
					vm.listPage = 0;
					vm.currentListAssignments = assignments.slice(0, vm.assignmentsShownLength);
					//zero indexed so use math floor
					vm.maxListPage = Math.floor(assignments.length / vm.assignmentsShownLength);
				}
			)
		}

		this.changePageNum = function(bIncreasingPage){
			if (bIncreasingPage && vm.listPage !== vm.maxListPage){
				vm.listPage++;
			}else if (!bIncreasingPage && vm.listPage !== 0){
				vm.listPage--;
			}

			var pageIndex = vm.listPage * vm.assignmentsShownLength;
			vm.currentListAssignments = vm.listAssignments.slice(pageIndex, pageIndex + vm.assignmentsShownLength);
		}
	})

	.controller('AssignmentController', 
		function($scope, $stateParams, UserInfo, AssignmentFactory, QuestionFactory, ExerciseFactory){

		var vm = this;
		vm.user = UserInfo.getUser();
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		vm.assignment = {};

		vm.openInfo = {
			deadlineType: 'select' //ask users to select a deadline type
		};

		var init = function(){
 			AssignmentFactory.getAssignment(vm.courseCode, vm.assignmentID).then(
				function Success(assignment){
					vm.assignment = assignment;
				}
			);
		}

		this.openAssignment = function(){
			AssignmentFactory.openAssignment(vm.courseCode, vm.assignmentID, vm.openInfo).then(
				function Success(res){
					vm.assignment.bIsOpen = true;
					vm.assignment.dueDate = vm.openInfo.dueDate;
					vm.assignment.deadlineType = vm.openInfo.deadlineType;
					vm.assignment.pointLoss = vm.openInfo.pointLoss;
				}
			)
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
		
		this.deleteQuestion = function(contentOrderIndex, questionIndex, questionID){
			QuestionFactory.deleteQuestion(vm.courseCode, vm.assignmentID, questionIndex, questionID).then(
				function Success(){
					vm.assignment.content.splice(contentOrderIndex, 1);
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

		this.deleteExercise = function(contentOrderIndex, exerciseIndex, exerciseID){
			ExerciseFactory.deleteExercise(vm.courseCode, vm.assignmentID, exerciseIndex, exerciseID).then(
				function Success(){
					vm.assignment.content.splice(contentOrderIndex, 1);
					vm.assignment.exercises.splice(exerciseIndex, 1);
					$scope.$broadcast('EXERCISE_DELETE', exerciseIndex);
				}
			);
		}

		init();
	})

	.controller('QuestionController', function($scope, $stateParams, QuestionFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;

		this.submitQuestion = function(){
			var answer = {
				answer: vm.question.studentAnswer,
				questionIndex: vm.question.questionIndex
			}

			QuestionFactory.submitQuestion(vm.courseCode, vm.assignmentID, answer).then(
				function Success(res){
					vm.question.tries++;

					if (res.data.bIsCorrect){
						vm.question.bIsCorrect = true;

						if (vm.question.questionType != 'frq' || vm.question.bIsHomework){
							vm.question.pointsEarned = vm.question.pointsWorth;
						}
					}
				}
			)
		}
	})

	.controller('QuestionEditController', function($scope, $stateParams, QuestionFactory){
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
						vm.question.bIsFinished = res.data.bIsFinished;
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

		//get the exercise contents from the parent scope
		vm.exercise = $scope.$parent.content;

		vm.editing = false;
		//this object is resolved in the onload option
		vm.aceEditor = {};
		//info we get after every compilation (output/errors)
		vm.compilationInfo = {};

		//user has to double click to delete a file
		vm.startDeleteFile = false;

		//select which file to run. Defaults at the file with the unit tests for teachers. 
		if (UserInfo.getUser().role === 'teacher'){
			vm.currentFile = 'Main';
		}else{
			vm.currentFile = Object.keys(vm.exercise.code)[0];
		}
		
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
				if (UserInfo.getUser().role === 'teacher'){
			    	aceEditor.setReadOnly(true);
				}

			    aceEditor.$blockScrolling = Infinity;

			    //Get the ace editor in our controller
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

		this.setCurrentFile = function(file){
			vm.currentFile = file;
			vm.startDeleteFile = false;
		}

		this.deleteFile = function(){
			//Click twice to delete
			if (!vm.startDeleteFile){
				vm.startDeleteFile = true;
				return;
			}

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
					vm.exercise.bIsFinished = res.data.bIsFinished;
					vm.toggleEdit();
				}
			)
		}

		this.testExercise = function(){
			ExerciseFactory.testExercise(vm.courseCode, vm.assignmentID, vm.exercise).then(
				function Success(res){
					vm.exercise.bIsFinished = res.data.bIsFinished;
					vm.compilationInfo.output = res.data.output;
					vm.compilationInfo.errors = res.data.errors;
				}
			)
		}

		this.submitExercise = function(){
			ExerciseFactory.submitExercise(vm.courseCode, vm.assignmentID, vm.exercise).then(
				function Success(res){
					var compilationInfo = res.data;
					vm.compilationInfo.output = compilationInfo.output;
					vm.compilationInfo.errors = compilationInfo.errors;

					vm.exercise.tries++;
					if (compilationInfo.bIsCorrect){
						vm.exercise.bIsCorrect = true;
						vm.exercise.pointsEarned = vm.exercise.pointsWorth;
					}
				}
			)
		}
	})
})();