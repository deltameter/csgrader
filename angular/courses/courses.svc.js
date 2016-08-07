(function(){
	'use strict';
	
	angular.module('courses').factory('CourseFactory', function ($http) {
		var courseCode = '';

		return {
			setParams: setParams,
			getCourse: getCourse,
			getCourses: getCourses,
			createCourse: createCourse,
			deleteCourse: deleteCourse,
			forkCourse: forkCourse,
			joinCourse: joinCourse,
			generateInviteCode: generateInviteCode
		}

		function setParams(setCourseCode){
			courseCode = setCourseCode;
		}

		function getCourse(){
			return $http.get('/api/course/' + courseCode).then(
				function Success(res){
					var course = res.data;

					if (typeof course.teacherInviteGenerateDate !== 'undefined'){
						//check if it's older than 1 day
						if (Date.now() - (1000 * 60 * 60 * 24) > course.teacherInviteGenerateDate){
							course.teacherInviteCode = 'invite expired'
						}
					}

					return course;
				}
			);
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

		function forkCourse(forkedCourse){
			return $http.post('/api/course/fork', forkedCourse).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			)
		}

		function joinCourse(joinInfo){
			return $http.put('/api/course/' + joinInfo.courseCode + '/invite/' + joinInfo.inviteCode).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			)
		}

		function deleteCourse(password){
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

		function generateInviteCode(){
			return $http.put('/api/course/' + courseCode + '/invite');
		}
	});
})();