(function(){
	angular.module('courses').factory('CourseService', function ($http, Session) {
		var courseService = {};

		courseService.createCourse = function(newCourse) {
			return $http
			.post('/api/course/create', newCourse)
			.then(function Success(res) {
				return res.data;
			}, function Failure(res){
				return res.data;
			});
		};

		return courseService;
	});
})();