(function(){
	angular.module('user').controller('DashboardController', function($state, $http, CourseService, Session){
		var root = this;
		this.newCourse = {};
		this.courses = null;
		this.user = Session.user;

		var getCourses = function(){
			CourseService.getCourses().then(
				function Success(res){
					root.courses = res.data;
				}, 
				function Failure(res){

				}
			);
		};

		this.createCourse = function(){
			CourseService.createCourse(root.newCourse).then(function(res){
				console.log(res);
			});
		}

		getCourses();
	});

	angular.module('user').controller('CourseController', 
		function($state, $http, $stateParams, CourseService, Session){
		var root = this;

		this.course = null;
		root.user = Session.user;

		this.newAssignment = {};

		var getCourse = function(){
			CourseService.getCourse($stateParams.courseCode).then(
				function Success(res){
					console.log(res);
					root.course = res.data;
					root.newAssignment.courseID = res.data._id;
				}, 
				function Failure(res){

				}
			);
		};

		this.createAssignment = function(){
			CourseService.createAssignment($stateParams.courseCode, root.newAssignment).then(
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