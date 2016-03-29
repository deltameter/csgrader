(function(){
	angular.module('classrooms').factory('ClassroomFactory', function($http){
		return {
			createClassroom: createClassroom,
			createStudent: createStudent,
			getClassroom: getClassroom,
			getClassrooms: getClassrooms,
			deleteClassroom: deleteClassroom,
			deleteStudent: deleteStudent
		};

		function createClassroom(courseCode, className){
			var newClassroom = {
				name: className
			}
			
			return $http.post('/api/course/' + courseCode + '/classroom/create', newClassroom).then(
				function Success(res){
					return res.data;
				}
			);
		};

		function createStudent(courseCode, classCode, newStudent){
			return $http.post('/api/course/' + courseCode + '/classroom/' + classCode + '/student/create', newStudent).then(
				function Success(res){
					return res.data;
				}
			);
		};

		function getClassroom(courseCode, classCode){
			return $http.get('/api/course/' + courseCode + '/classroom/' + classCode).then(
				function Success(res){
					return res.data;
				}
			);
		};

		function getClassrooms(courseCode){
			return $http.get('/api/course/' + courseCode + '/classroom').then(
				function Success(res){
					return res.data;
				}
			);
		};

		function deleteClassroom(courseCode, classCode){
			return $http.delete('/api/course/' + courseCode + '/classroom/' + classCode).then(
				function Success(res){
					return res.data;
				}
			)
		}

		function deleteStudent(courseCode, classCode, studentID){
			return $http.delete('/api/course/' + courseCode + '/classroom/' + classCode + '/student/delete/' + studentID).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					console.log(res)
				}
			)
		}
	})
})();