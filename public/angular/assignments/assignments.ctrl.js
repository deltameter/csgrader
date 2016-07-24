(function(){
	function choosePanelClass(classes, role, bIsFinished, bIsCorrect, bIsAttempted){
		if (bIsFinished && role === 'teacher'){
			return classes.success;
		}else if (bIsCorrect && role === 'student'){
			return classes.success;
		}else if (bIsAttempted && role === 'student'){
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

	.controller('AssignmentsController', function($scope, $stateParams, $state, ModalService, AssignmentFactory){
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

		this.showAssignmentCreationModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/assignments/partials/createAssignmentModal.html',
				controller: 'mCreateAssignmentController',
				controllerAs: 'createAssignmentCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(assignment) {
					if (assignment){
						const params = { courseCode: vm.courseCode, assignmentID: assignment.assignmentID };
						console.log(params)
						$state.go('root.assignment', params);
					}
				});
			});
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

	.controller('mCreateAssignmentController', function($stateParams, $element, close, AssignmentFactory){
		var vm = this;

		//without this, the modal will not close if you click away
		//it will just hide itself
		//if you click away and then open the modal again and submit, it will call close() twice
		//once for the new modal, and once for the old invisible modal
		$element.on('hidden.bs.modal', function(){ 
			if (!vm.closed){
				return close(null, 500) 
			}
		});

		this.create = function(){
			AssignmentFactory.createAssignment($stateParams.courseCode, vm.newAssignment).then(
				function Success(assignment){
					if (typeof assignment.userMessages !== 'undefined'){
						vm.userMessages = assignment.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						vm.closed = true;
						//success so close
						close(assignment, 500);
					}
				}
			);
		}

	})

	.controller('AssignmentController', 
		function($scope, $stateParams, ModalService, UserInfo, AssignmentFactory, QuestionFactory, ExerciseFactory){

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

		//the exercise and question will tell us when we need to update point totals
		$scope.$on('POINTS_EARNED', function(event, points){
			vm.assignment.pointsEarned += points;
		})

		this.getProgressBarWidth = function(){
			return (vm.assignment.pointsEarned*100/vm.assignment.pointsWorth).toString() + '%'
		}

		this.hasContent = function(){
			return Object.keys(vm.assignment).length > 0 &&
			 (vm.assignment.exercises.length > 0 || vm.assignment.questions.length > 0);
		}

		this.showOpenModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/assignments/partials/openAssignmentModal.html',
				controller: 'mOpenAssignmentController',
				controllerAs: 'openAssignmentCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result){
						vm.assignment.bIsOpen = true;
						vm.assignment.pointsWorth = AssignmentFactory.calculateTotalPoints(vm.assignment);
						vm.assignment.dueDate = result.dueDate;
						vm.assignment.deadlineType = result.deadlineType;
						vm.assignment.pointLoss = result.pointLoss;
					}
				});
			});
		}

		this.showCloseModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/assignments/partials/closeAssignmentModal.html',
				controller: 'mCloseAssignmentController',
				controllerAs: 'closeAssignmentCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result){
						vm.assignment.bIsOpen = false;
					}
				});
			});
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
			QuestionFactory.deleteQuestion(vm.courseCode, vm.assignmentID, questionID).then(
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
			ExerciseFactory.deleteExercise(vm.courseCode, vm.assignmentID, exerciseID).then(
				function Success(){
					vm.assignment.content.splice(contentOrderIndex, 1);
					vm.assignment.exercises.splice(exerciseIndex, 1);
					$scope.$broadcast('EXERCISE_DELETE', exerciseIndex);
				}
			);
		}

		init();
	})
	
	.controller('mOpenAssignmentController', function($scope, $stateParams, $element, close, AssignmentFactory){
		var vm = this;

		//without this, the modal will not close if you click away
		//it will just hide itself
		//if you click away and then open the modal again and submit, it will call close() twice
		//once for the new modal, and once for the old invisible modal
		$element.on('hidden.bs.modal', function(){ 
			if (!vm.closed){
				return close(null, 500) 
			}
		});

		this.openAssignment = function(){
			AssignmentFactory.openAssignment($stateParams.courseCode, $stateParams.assignmentID, vm.openInfo).then(
				function Success(data){
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						vm.closed = true;

						//success so close
						close(vm.openInfo, 500);
					}
				}
			)
		}
	})

	.controller('mCloseAssignmentController', function($scope, $stateParams, $element, close, AssignmentFactory){
		var vm = this;

		//without this, the modal will not close if you click away
		//it will just hide itself
		//if you click away and then open the modal again and submit, it will call close() twice
		//once for the new modal, and once for the old invisible modal
		$element.on('hidden.bs.modal', function(){ 
			if (!vm.closed){
				return close(null, 500) 
			}
		});

		this.close = function(){
			AssignmentFactory.closeAssignment($stateParams.courseCode, $stateParams.assignmentID, vm.password).then(
				function Success(data){
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						vm.closed = true;

						//success so close
						close(true, 500);
					}
				}
			)
		}
	})

	.controller('QuestionController', function($scope, $stateParams, $timeout, $element, UserInfo, QuestionFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;
		vm.assignmentID = $stateParams.assignmentID;

		//get the question contents from the parent scope
		vm.question = $scope.$parent.content;

		const panelClasses = {
			panel: {
				success: 'panel-success',
				warning: 'panel-warning',
				normal: 'panel-default'
			},
			button: {
				success: 'btn-default',
				warning: 'btn-default',
				normal: 'btn-info'
			}
		}

		this.getPanelClass = function(type){
			const bIsCorrect = vm.question.bIsCorrect || (vm.question.questionType === 'frq' && vm.question.tries > 0)
			
			return choosePanelClass(panelClasses[type], UserInfo.getUser().role, 
				vm.question.bIsFinished, bIsCorrect, vm.question.tries > 0);
		}

		this.submitQuestion = function(){
			var submitTime = Date.now();

			vm.bBackendComputing = true;
			QuestionFactory.submitQuestion(vm.courseCode, vm.assignmentID, vm.question._id, vm.question.studentAnswer).then(
				function Success(res){
					vm.question.tries++;

					if (res.data.bIsCorrect){
						vm.question.bIsCorrect = true;

						if (vm.question.questionType != 'frq' || vm.question.bIsHomework){
							vm.question.pointsEarned = vm.question.pointsWorth;
							$scope.$emit('POINTS_EARNED', vm.question.pointsEarned);
						}
					}

					$timeout(function(){
						vm.bBackendComputing = false;
					}, Math.max(50, 300 + submitTime - Date.now()))
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

	.controller('QuestionEditController', function($scope, $stateParams, $timeout, $element, QuestionFactory){
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
			var newFile = ExerciseFactory.createNewFile(this.newFileName, this.exercise);

			if (newFile !== false){
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
			vm.focusFileType = 'code';
		}

		const panelClasses = {
			panel: {
				success: 'panel-success',
				warning: 'panel-warning',
				normal: 'panel-default'
			},
			button: {
				success: 'btn-default',
				warning: 'btn-default',
				normal: 'btn-info'
			}
		}

		this.getPanelClass = function(type){
			return choosePanelClass(panelClasses[type], UserInfo.getUser().role, 
				(vm.exercise.bIsFinished && vm.exercise.bIsTested), vm.exercise.bIsCorrect, vm.exercise.tries > 0);
		}

		this.testExercise = function(){
			vm.bBackendComputing = true;

			ExerciseFactory.testExercise(this.courseCode, vm.assignmentID, vm.exercise._id, vm.exercise.solutionCode).then(
				function Success(res){
					vm.exercise.bIsTested = res.data.bIsCorrect;
					vm.compilationInfo.testResults = res.data.testResults;
					vm.compilationInfo.errors = res.data.errors;
					vm.bBackendComputing = false;
				}
			)
		}

		this.submitExercise = function(){
			vm.bBackendComputing = true;

			ExerciseFactory.submitExercise(vm.courseCode, vm.assignmentID, vm.exercise._id, vm.exercise.code).then(
				function Success(res){
					var compilationResults = res.data;
					console.log('pointsearned: ' + compilationResults.pointsEarned)
					vm.compilationInfo.testResults = compilationResults.testResults;
					vm.compilationInfo.errors = compilationResults.errors;

					vm.exercise.tries++;

					//add points to our assignment.
					//subtract previously earned points from newly earned points to get net points earned
					$scope.$emit('POINTS_EARNED', compilationResults.pointsEarned - vm.exercise.pointsEarned);
					vm.exercise.pointsEarned = compilationResults.pointsEarned;

					vm.exercise.bIsCorrect = compilationResults.bIsCorrect;

					vm.bBackendComputing = false;
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

		//used for ngPattern
		$scope.onlyNumbers = /^\d+$/;

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

		this.recalculateTotalPoints = function(){
			var totalPoints = 0;
			vm.exercise.tests.forEach(function(test){
				if (typeof test.pointsWorth !== 'undefined' && typeof parseInt(test.pointsWorth) === 'number'){
					totalPoints += parseInt(test.pointsWorth);
				}
			})
			vm.exercise.pointsWorth = totalPoints;
		}
	})
})();