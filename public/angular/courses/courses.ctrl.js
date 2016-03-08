(function(){
	angular.module('user').controller('DashboardController', function($state, $http, CourseFactory, UserInfo){
		var vm = this;
		this.newCourse = {};
		this.courses = null;
		this.user = UserInfo.getUser();

		var getCourses = function(){
			CourseFactory.getCourses().then(
				function Success(res){
					vm.courses = res.data;
				}, 
				function Failure(res){

				}
			);
		};

		this.createCourse = function(){
			CourseFactory.createCourse(vm.newCourse).then(function(res){
				console.log(res);
			});
		}

		getCourses();
	});

	angular.module('user').controller('CourseController', 
		function($state, $http, $stateParams, UserInfo, CourseFactory, AssignmentFactory){

		var vm = this;

		vm.course = null;
		vm.user = UserInfo.getUser();
		vm.newAssignment = {};

		var getCourse = function(){
			CourseFactory.getCourse($stateParams.courseCode).then(
				function Success(res){
					vm.course = res.data;
				}, 
				function Failure(res){

				}
			);
		};

		this.createAssignment = function(){
			AssignmentFactory.createAssignment($stateParams.courseCode, vm.newAssignment).then(
				function Success(assignment){
					vm.course.assignments.push(assignment);
				}, 
				function Failure(res){

				}
			);
		}

		getCourse();
	});
})();