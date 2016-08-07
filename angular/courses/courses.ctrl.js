(function(){
	'use strict';

	angular.module('user').controller('DashboardController', function($state, ModalService, CourseFactory, UserInfo){
		var vm = this;
		vm.user = UserInfo.getUser();

		function init(){
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

		init();
	})

	.controller('mCourseCreationController', function($scope, $element, close, CourseFactory){
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

		//create, fork, or join
		vm.type = 'create';

		function SuccessPromise(data){
			if (typeof data.userMessages !== 'undefined'){
				vm.userMessages = data.userMessages;
			}else{
				//we have to manually close the modal because we have a complex form
				$element.modal('hide');

				vm.closed = true;

				//success so close
				close(vm.returnCourse, 500);
			}
		}

		this.submit = function(){
			if (vm.type === 'create' && $scope.createForm.$valid){
				vm.returnCourse = vm.newCourse;
				CourseFactory.createCourse(vm.newCourse).then(SuccessPromise)
			}else if (vm.type === 'fork' && $scope.forkForm.$valid){
				console.log('memes')
				vm.returnCourse = vm.forkCourse;
				CourseFactory.forkCourse(vm.forkCourse).then(SuccessPromise)
			}else if (vm.type === 'join' && $scope.joinForm.$valid){
				vm.returnCourse = vm.joinCourse;
				CourseFactory.joinCourse(vm.joinCourse).then(SuccessPromise)
			}
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

		function init(){
			CourseFactory.setParams($stateParams.courseCode)

			CourseFactory.getCourse().then(
				function Success(course){
					vm.user = UserInfo.getUser();
					vm.course = course;
				}
			);
		}

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

		this.generateInviteCode = function(){
			CourseFactory.generateInviteCode().then(
				function Success(res){
					vm.course.teacherInviteCode = res.data.inviteCode;
				}
			)
		}

		init();
	})

	.controller('mCourseDeletionController', function($element, close, CourseFactory){
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
			CourseFactory.deleteCourse(vm.password).then(
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
