(function(){
	angular.module('user').controller('DashboardController', function($state, $http, CourseFactory, UserFactory){
		var vm = this;
		this.newCourse = {};
		this.courses = null;
		this.user = UserFactory.getUser();

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
		function($state, $http, $stateParams, UserFactory, CourseFactory, AssignmentFactory){

		var vm = this;

		this.course = null;
		this.user = UserFactory.getUser();
		this.newAssignment = {};

		var getCourse = function(){
			CourseFactory.getCourse($stateParams.courseCode).then(
				function Success(res){
					console.log(res);
					vm.course = res.data;
					vm.newAssignment.courseID = res.data._id;
				}, 
				function Failure(res){

				}
			);
		};

		this.createAssignment = function(){
			AssignmentFactory.createAssignment($stateParams.courseCode, vm.newAssignment).then(
				function Success(res){
					console.log(res);
				}, 
				function Failure(res){

				}
			);
		}

		getCourse();
	});
})();