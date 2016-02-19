(function(){
	angular.module('user').controller('DashboardController', function($state, $http, CourseService, Session){
		var root = this;
		root.newCourse = {};
		root.courses = [];
		root.user = Session.user;

		var getCourses = function(){
			$http
			.get('/api/profile/courses')
			.then(function(res){
				root.courses = res.data;
				console.log(res.data);
			});
		};

		this.createCourse = function(){
			CourseService.createCourse(root.newCourse).then(function(res){
				console.log(res);
			});
		}

		getCourses();
	});
})();