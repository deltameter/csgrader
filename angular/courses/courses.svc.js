(function(){
	'use strict';
	
	angular.module('courses').factory('CourseFactory', function ($http) {
		return {
			getCourse: getCourse,
			getCourses: getCourses,
			createCourse: createCourse,
			deleteCourse: deleteCourse
		}

		function getCourse(courseCode){
			return $http.get('/api/course/' + courseCode);
		}

		function getCourses(){
			return $http.get('/api/course');
		}

		function createCourse(newCourse){
			return $http.post('/api/course/create', newCourse).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			);
		};

		function deleteCourse(courseCode, password){
			var requestInfo = { 
				url: '/api/course/' + courseCode, 
				method: 'DELETE', 
				data: { password: password }, 
				headers: {"Content-Type": "application/json;charset=utf-8" }
			};

			return $http(requestInfo).then(
				function Success(res){
					return res.data;
				}, 
				function Error(res){
					return res.data;
				}
			);
		}
	});
})();