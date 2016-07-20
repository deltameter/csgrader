(function(){
	angular.module('classrooms')
	.controller('ClassroomController', function($stateParams, $state, ModalService, StudentFactory, ClassroomFactory){
		var vm = this;

		vm.courseCode = $stateParams.courseCode;

		vm.classroom = {};
		vm.newStudent = {};

		var getClassroom = function(){
			ClassroomFactory.getClassroom($stateParams.courseCode, $stateParams.classCode).then(
				function Success(res){
					vm.classroom = res;
				}
			);
		}

		this.createStudent = function(){
			StudentFactory.createStudent($stateParams.courseCode, $stateParams.classCode, vm.newStudent).then(
				function Success(res){
					vm.classroom.students.push(res);
					vm.newStudent = {};
				}
			)
		}

		this.editStudent = function(student, form){
			StudentFactory.editStudent($stateParams.courseCode, $stateParams.classCode, student).then(
				function Success(res){
					form.$setPristine();
				}
			);
		}

		this.deleteStudent = function(studentID){
			StudentFactory.deleteStudent($stateParams.courseCode, $stateParams.classCode, studentID).then(
				function Success(res){
					for(var i = 0; i < vm.classroom.students.length; i++){
						if (vm.classroom.students[i]._id === studentID){
							vm.classroom.students.splice(i, 1);
							break;
						}
					}
				}
			)
		}

		this.openDeleteClassroomModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/classrooms/partials/deleteClassroomModal.html',
				controller: 'mDeleteClassroomController',
				controllerAs: 'deleteClassroomCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					$state.go('root.classrooms', { courseCode: vm.courseCode });
				});
			});
		}

		getClassroom();
	})

	.controller('mDeleteClassroomController', function($stateParams, $element, close, ClassroomFactory){
		var vm = this;

		this.delete = function(){
			ClassroomFactory.deleteClassroom($stateParams.courseCode, $stateParams.classCode, vm.password).then(
				function Success(data){
					console.log(data)
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');
						//success so close
						close(data, 500);
					}
				}
			)
		}
	})

	.controller('ClassroomsController', function($stateParams, $state, ModalService, ClassroomFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.classrooms = [];

		var getClassrooms = function(){
			ClassroomFactory.getClassrooms($stateParams.courseCode).then(
				function Success(res){
					vm.classrooms = res;
				}
			)
		}

		this.openCreateClassroomModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/classrooms/partials/createClassroomModal.html',
				controller: 'mCreateClassroomController',
				controllerAs: 'createClassroomCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					$state.go('root.classroom', { courseCode: vm.courseCode, classCode: result.classCode });
				});
			});
		}

		getClassrooms();
	})

	.controller('mCreateClassroomController', function($stateParams, $element, close, ClassroomFactory){
		var vm = this;

		this.create = function(){
			ClassroomFactory.createClassroom($stateParams.courseCode, vm.newClassroomName).then(
				function Success(data){
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');
						//success so close
						close(data, 500);
					}
				}
			)
		}
	})
})();