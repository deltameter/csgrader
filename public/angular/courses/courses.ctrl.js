(function(){
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
				templateUrl: '/angular/courses/partials/courseCreationModal.html',
				controller: 'mCourseCreationController',
				controllerAs: 'courseCreationCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					$state.go('root.course', { courseCode: res.courseCode })
				});
			});
		}

		this.showRegistrationModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/courses/partials/registrationModal.html',
				controller: 'mRegistrationController',
				controllerAs: 'registrationCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					$state.go('root.course', { courseID: res.courseCode })
				});
			});
		}

		getCourses();
	})

	.controller('mCourseCreationController', function($element, close, CourseFactory){
		var vm = this;

		this.create = function(){
			CourseFactory.createCourse(vm.newCourse).then(
				function Success(data){
					if (typeof data.userMessage !== 'undefined'){
						vm.userMessage = data.userMessage;
					}else{
						//we have to manually close the modal because we have a complex form
						$element.modal('hide');

						//success so close
						close(vm.newCourse, 500);
					}
				}
			)
		}
	})

	.controller('mRegistrationController', function($element, close, UserFactory){
		var vm = this;

		this.create = function(){
			UserFactory.registerForCourse(vm.regInfo).then(
				function Success(data){
					if (typeof data.userMessage !== 'undefined'){
						vm.userMessage = data.userMessage;
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
					console.log(vm.course);	
				}
			);
		};

		this.showDeleteCourseModal = function(){
			ModalService.showModal({
				templateUrl: '/angular/courses/partials/deleteCourseModal.html',
				controller: 'mCourseDeletionController',
				controllerAs: 'courseDeletionCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(res){
					$state.go('root.main.dashboard')
				});
			});
		}

		getCourse();
	})

	.controller('mCourseDeletionController', function($stateParams, $element, close, CourseFactory){
		var vm = this;

		this.delete = function(){
			CourseFactory.deleteCourse($stateParams.courseCode, vm.password).then(
				function Success(data){
					if (typeof data.userMessage !== 'undefined'){
						vm.userMessage = data.userMessage;
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