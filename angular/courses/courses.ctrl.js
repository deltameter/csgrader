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

		this.showAddCourseModal = function(){
			ModalService.showModal({
				templateUrl: '/partials/courses/modals/addCourseModal.html',
				controller: 'mAddCourseModal',
				controllerAs: 'addCourseCtrl'
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

	.controller('mAddCourseModal', function($scope, $element, UserInfo, close, CourseFactory){
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

		vm.user = UserInfo.getUser();

		//create, fork, join, or register
		if (vm.user.role === 'teacher'){
			vm.type = 'create';
		}else if (vm.user.role === 'aide'){
			vm.type = 'join';
		}else{
			vm.type = 'register';
		}
		

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
				vm.returnCourse = vm.forkCourse;
				CourseFactory.forkCourse(vm.forkCourse).then(SuccessPromise)
			}else if (vm.type === 'join' && $scope.joinForm.$valid){
				vm.returnCourse = vm.joinCourse;
				CourseFactory.joinCourse(vm.joinCourse).then(SuccessPromise)
			}else if (vm.type === 'register' && $scope.registerForm.$valid){
				vm.returnCourse = vm.regInfo;
				CourseFactory.registerForCourse(vm.regInfo).then(SuccessPromise)
			}

		}
	})

	.controller('CourseController',
		function($state, $http, $stateParams, ModalService, UserInfo, CourseFactory, AssignmentFactory){

		var vm = this;
		vm.user = UserInfo.getUser();
		
		function init(){
			CourseFactory.setParams($stateParams.courseCode)

			CourseFactory.getCourse().then(
				function Success(course){
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
					vm.course.inviteCode = res.data.inviteCode;
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
