(function(){
	angular.module('classrooms')

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
				templateUrl: '/partials/classrooms/createClassroomModal.html',
				controller: 'mCreateClassroomController',
				controllerAs: 'createClassroomCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					console.log(result)
					if (result){
						$state.go('root.classroom', { courseCode: vm.courseCode, classCode: result.classCode });
					}
				});
			});
		}

		getClassrooms();
	})

	.controller('mCreateClassroomController', function($stateParams, $element, close, ClassroomFactory){
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
			ClassroomFactory.createClassroom($stateParams.courseCode, vm.newClassroomName).then(
				function Success(data){
					console.log(data.userMessages)
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						vm.closed = true;
						//success so close
						close(data, 500);
					}
				}
			)
		}
	})

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
				templateUrl: '/partials/classrooms/deleteClassroomModal.html',
				controller: 'mDeleteClassroomController',
				controllerAs: 'deleteClassroomCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result){
						$state.go('root.classrooms', { courseCode: vm.courseCode });
					}
				});
			});
		}

		getClassroom();
	})

	.controller('mDeleteClassroomController', function($stateParams, $element, close, ClassroomFactory){
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

		this.delete = function(){
			ClassroomFactory.deleteClassroom($stateParams.courseCode, $stateParams.classCode, vm.password).then(
				function Success(data){
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');
						
						//so we don't close it again in the $element watcher
						vm.closed = true;

						//success so close
						close(data, 500);
					}
				}
			)
		}
	})
})();