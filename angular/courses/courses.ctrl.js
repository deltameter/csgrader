(function(){
	'use strict';
	
	angular.module('user').controller('DashboardController', function($state, ModalService, CourseFactory, UserInfo){
		var vm = this;
		this.newCourse = {};
		this.courses = null;
		this.user = UserInfo.getUser();

		var getCourses = function(){
			CourseFactory.getCourses().then(
				function Success(res){
					vm.courses = res.data;
				}
			);
		};

		this.showCourseCreationModal = function(){
			ModalService.showModal({
				templateUrl: '/partials/courses/modals/courseCreationModal.html',
				controller: 'mCourseCreationController',
				controllerAs: 'courseCreationCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					if (res){
						$state.go('root.course', { courseCode: res.courseCode })
					}
				});
			});
		}

		this.showRegistrationModal = function(){
			ModalService.showModal({
				templateUrl: '/partials/courses/modals/registrationModal.html',
				controller: 'mRegistrationController',
				controllerAs: 'registrationCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					if (res){
						$state.go('root.course', { courseCode: res.courseCode })
					}
				});
			});
		}

		getCourses();
	})

	.controller('mCourseCreationController', function($element, close, CourseFactory){
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
			CourseFactory.createCourse(vm.newCourse).then(
				function Success(data){
					if (typeof data.userMessages !== 'undefined'){
						vm.userMessages = data.userMessages;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						vm.closed = true;

						//success so close
						close(vm.newCourse, 500);
					}
				}
			)
		}
	})

	.controller('mRegistrationController', function($element, close, UserFactory){
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

		this.register = function(){
			UserFactory.registerForCourse(vm.regInfo).then(
				function Success(data){
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

	.controller('CourseController', 
		function($state, $http, $stateParams, ModalService, UserInfo, CourseFactory, AssignmentFactory){

		var vm = this;

		vm.course = null;
		vm.user = UserInfo.getUser();
		vm.newAssignment = {};

		var getCourse = function(){
			CourseFactory.getCourse($stateParams.courseCode).then(
				function Success(res){
					vm.course = res.data;
				}
			);
		};

		this.showDeleteCourseModal = function(){
			ModalService.showModal({
				templateUrl: '/partials/courses/modals/deleteCourseModal.html',
				controller: 'mCourseDeletionController',
				controllerAs: 'courseDeletionCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					if (res){
						$state.go('root.main.dashboard')
					}
				});
			});
		}

		getCourse();
	})

	.controller('mCourseDeletionController', function($stateParams, $element, close, CourseFactory){
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
			CourseFactory.deleteCourse($stateParams.courseCode, vm.password).then(
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
})();