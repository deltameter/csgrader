(function(){
	angular.module('courses').factory('CourseService', function ($http) {
		this.createCourse = function(newCourse) {
			return $http.post('/api/course/create', newCourse);
		};

		this.getCourses = function(){
			return $http.get('/api/profile/courses');
		}

		this.getCourse = function(courseCode){
			return $http.get('/api/course/' + courseCode);
		}

		return this;
	});
})();