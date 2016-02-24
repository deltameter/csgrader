(function(){
	angular.module('courses').factory('CourseFactory', function ($http) {
		return {
			createCourse: createCourse,
			getCourse: getCourse,
			getCourses: getCourses
		}

		function createCourse(newCourse) {
			return $http.post('/api/course/create', newCourse);
		};

		function getCourse(courseCode){
			return $http.get('/api/course/' + courseCode);
		}

		function getCourses(){
			return $http.get('/api/profile/courses');
		}
	});
})();