(function(){

	function choosePanelClass(role, bIsFinished, bIsCorrect, classes){
		if (bIsFinished && role === 'teacher'){
			return classes.success;
		}else if (bIsCorrect && role === 'student'){
			return classes.success;
		}else if (!bIsCorrect && role === 'student'){
			return classes.warning;
		}else{
			return classes.normal;
		}
	}

	function scrollToElement(element, offset) {
		var el = angular.element(element)[0]
	    var top = 0;
	    do {
	        top += el.offsetTop  || 0;
	        el = el.offsetParent;
	    } while(el)

		window.scrollTo(0, top - offset);
	}


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

	.controller('QuestionController', function($scope, $stateParams, $timeout, UserInfo, QuestionFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;

		this.getPanelClass = function(){
			var classes = {
				success: 'panel-success',
				warning: 'panel-warning',
				normal: 'panel-default'
			}

			return choosePanelClass(UserInfo.getUser().role, vm.question.bIsFinished, vm.question.bIsCorrect, classes);
		}

		this.getPanelButtonClass = function(){
			var classes = {
				success: 'btn-default',
				warning: 'btn-default',
				normal: 'btn-info'
			}

			return choosePanelClass(UserInfo.getUser().role, vm.question.bIsFinished, vm.question.bIsCorrect, classes);
		}

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

		$scope.$watch('bShowNormal', function(bShowNormal, old){
			if (bShowNormal && !old) {
				$timeout(function(){
					scrollToElement($element, 70);
				}, 50);
			}
		});

		this.toggleEdit = function(){
			$scope.$parent.bIsEditing = true;

			//$scope.$parent becomes null for some reason inside timeout. 
			var scopeParent = $scope.$parent;
			$timeout(function(){
				scopeParent.bShowEdit = true;
				scopeParent.bIsNormal = false;
				scopeParent.bShowNormal = false;
			}, 250);
		}
	})

	.controller('QuestionEditController', function($scope, $stateParams, $timeout, QuestionFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;
		
		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;
		//use to compare and check if the thing has been changed
		vm.questionSnapshot = JSON.parse(JSON.stringify(vm.question));

		$scope.tinymceOptions = {
		  	inline: false,
		    plugins: 'autolink link image code',
    		toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | image link code',
		  	skin: 'lightgray',
		  	theme : 'modern'
		};

		$scope.$on('QUESTION_DELETE', function(event, questionIndex){
			if (vm.question.questionIndex > questionIndex){
				vm.question.questionIndex--;
			}
		});

		this.addAnswer = function(){
			vm.question.answers.push('');
		}

		this.deleteAnswer = function(index){
			vm.question.answers.splice(index, 1);
		}

		$scope.$watch('bShowEdit', function(bShowEdit, old){
			if (bShowEdit && !old) {
				$timeout(function(){
					scrollToElement($element, 70);
				}, 50);
			}
		});
		
		var toggleEdit = function(){
			$scope.$parent.bIsNormal = true;

			//$scope.$parent becomes null for some reason inside timeout. 
			var scopeParent = $scope.$parent;

			$timeout(function(){
				scopeParent.bIsEditing = false;
				scopeParent.bShowEdit = false;
				scopeParent.bShowNormal = true;
			}, 250);
		}

		this.editQuestion = function(){
			if (!angular.equals(vm.question, vm.questionSnapshot)){
				QuestionFactory.editQuestion(vm.courseCode, vm.assignmentID, vm.question).then(
					function Success(res){
						vm.question.bIsFinished = res.data.bIsFinished;
						toggleEdit();
					}
				)
			}else{
				toggleEdit();
			}
		}

	})

	.controller('ExerciseBaseController', function($scope, $stateParams, Config, UserInfo, ExerciseFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		//get the exercise contents from the parent scope
		vm.exercise = $scope.$parent.content;

		vm.editing = false;

		//info we get after every compilation (output/errors)
		vm.compilationInfo = {};

		vm.focusFileType = 'tests';

		//the index of the currently focused file
		vm.focusedFileIndex = 0;

		//configure ace
		vm.aceOptions = {
			//workerPath: '/bower_components/ace-builds/src-min-noconflict/',
			//mode: 'java',
			onLoad: function(aceEditor) {
			    aceEditor.$blockScrolling = Infinity;

			    //Get the ace editor in our controller
			    vm.aceEditor = aceEditor;
			}
		}

		$scope.$on('EXERCISE_DELETE', function(event, exerciseIndex){
			if (vm.exercise.exerciseIndex > exerciseIndex){
				vm.exercise.exerciseIndex--;
			}
		});

		this.resetExercise = function(){
			this.compilationInfo = {};
		}

		this.swapFocusFileType = function(){
			//the focus can either be on the tests or the starter code
			this.focusFileType = this.focusFileType === 'tests' ? 'code' : 'tests';
			this.focusedFileIndex = 0;
		}

		this.focusFile = function(index){
			this.focusedFileIndex = index;
		}

		this.addFile = function(){
			if (typeof this.newFileName === 'undefined' || this.newFileName.length === 0){
				return;
			}

			//remove the extension and create a newfile
			var newFile = ExerciseFactory.createNewFile(this.newFileName.split('.')[0], this.exercise);

			if (newFile !== false){
				console.log(this.exercise);
				this.exercise[this.focusFileType].push(newFile);
				this.newFileName = '';
			}

		}

		this.deleteFile = function(index){
			//var index = Exercise.deleteFile(this.exercise.code, deleteFile)
			this.exercise[this.focusFileType].splice(index, 1);
		}

	})

	.controller('ExerciseController', function($scope, $controller, $timeout, UserInfo, $element, ExerciseFactory){
		var vm = this;

		angular.extend(vm, $controller('ExerciseBaseController', {$scope: $scope}));

		if (UserInfo.getUser().role === 'teacher'){
			vm.focusFileType = 'solutionCode';
		}else{
			console.log(UserInfo)
			vm.focusFileType = 'code';
		}

		this.getPanelClass = function(type){
			var classes;
			if (type === 'panel'){
				classes	= {
					success: 'panel-success',
					warning: 'panel-warning',
					normal: 'panel-default'
				}
			}else if (type === 'button'){
				classes = {
					success: 'btn-default',
					warning: 'btn-default',
					normal: 'btn-info'
				}
			}
	
			return choosePanelClass(UserInfo.getUser().role, (vm.exercise.bIsFinished && vm.exercise.bIsTested), vm.exercise.bIsCorrect, classes);
		}


		this.testExercise = function(){
			ExerciseFactory.testExercise(this.courseCode, vm.assignmentID, vm.exercise.exerciseIndex, vm.exercise.solutionCode).then(
				function Success(res){
					vm.exercise.bIsTested = res.data.bIsCorrect;
					vm.compilationInfo.testResults = res.data.testResults;
					vm.compilationInfo.errors = res.data.errors;
				}
			)
		}

		this.submitExercise = function(){
			ExerciseFactory.submitExercise(vm.courseCode, vm.assignmentID, vm.exercise.exerciseIndex, vm.exercise.code).then(
				function Success(res){
					var compilationInfo = res.data;
					vm.compilationInfo.testResults = compilationInfo.testResults;
					vm.compilationInfo.errors = compilationInfo.errors;

					vm.exercise.tries++;
					if (compilationInfo.bIsCorrect){
						vm.exercise.bIsCorrect = true;
						vm.exercise.pointsEarned = vm.exercise.pointsWorth;
					}
				}
			)
		}

		$scope.$watch('bShowNormal', function(bShowNormal, old){
			if (bShowNormal && !old) {
				$timeout(function(){
					scrollToElement($element, 70);
				}, 50);
			}
		});

		this.toggleEdit = function(){
			$scope.$parent.bIsEditing = true;

			//$scope.$parent becomes null for some reason inside timeout. 
			var scopeParent = $scope.$parent;
			$timeout(function(){
				scopeParent.bShowEdit = true;
				scopeParent.bIsNormal = false;
				scopeParent.bShowNormal = false;
			}, 250);
		}

	})

	.controller('ExerciseEditController', function($scope, $controller, $timeout, $element, ExerciseFactory){
		var vm = this;

		angular.extend(vm, $controller('ExerciseBaseController', {$scope: $scope}));

		vm.exerciseSnapshot = JSON.parse(JSON.stringify(vm.exercise));

		this.editExercise = function(){
			if (!angular.equals(vm.exercise, vm.exerciseSnapshot)){
				ExerciseFactory.editExercise(vm.courseCode, vm.assignmentID, vm.exercise).then(
					function Success(res){
						vm.exercise.bIsFinished = res.data.bIsFinished;
						vm.toggleEdit();
					}
				)
			}else{
				vm.toggleEdit();
			}
		}

		$scope.$watch('bShowEdit', function(bShowEdit, old){
			if (bShowEdit && !old) {
				$timeout(function(){
					scrollToElement($element, 70);
				}, 50);
			}
		});

		this.toggleEdit = function(){
			$scope.$parent.bIsNormal = true;

			//$scope.$parent becomes null for some reason inside timeout. 
			var scopeParent = $scope.$parent;

			$timeout(function(){
				scopeParent.bIsEditing = false;
				scopeParent.bShowEdit = false;
				scopeParent.bShowNormal = true;
			}, 250);
		}
	})
})();