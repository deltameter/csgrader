(function(){
	'use strict';
	
	angular.module('classrooms')
	.factory('ClassroomFactory', function($http){
		return {
			createClassroom: createClassroom,
			getClassroom: getClassroom,
			getClassrooms: getClassrooms,
			deleteClassroom: deleteClassroom
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

		function deleteClassroom(courseCode, classCode, password){
			var requestInfo = { 
				url: '/api/course/' + courseCode + '/classroom/' + classCode,
				method: 'DELETE', 
				data: { password: password }, 
				headers: {"Content-Type": "application/json;charset=utf-8" }
			};

			return $http(requestInfo).then(
				function Success(res){
					return res.data;
				}, 
				function Failure(res){
					return res.data;
				}
			)
		}
	})

	.factory('StudentFactory', function($http, $injector){
		return {
			createStudent: createStudent,
			importStudents: importStudents,
			editStudent: editStudent,
			deleteStudent: deleteStudent
		};

		function createStudent(courseCode, classCode, newStudent){
			return $http.post('/api/course/' + courseCode + '/classroom/' + classCode + '/student/create', newStudent).then(
				function Success(res){
					return res.data;
				}
			);
		};

		function importStudents(courseCode, classCode, file){
			var Upload = $injector.get('Upload');
			file.upload = Upload.upload({
				url: '/api/course/' + courseCode + '/classroom/' + classCode + '/student/import',
				data: { students: file },
			});

			return file.upload.then(function(res){
				return res.data;
			});
		}

		function editStudent(courseCode, classCode, student){
			var studentInfo = {
				studentClassID: student._id,
				firstName: student.firstName,
				lastName: student.lastName,
				gradebookID: student.gradebookID
			}

			return $http.put('/api/course/' + courseCode + '/classroom/' + classCode + '/student/edit', studentInfo).then(
				function Success(res){
					return res.data;
				}
			);
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
		};
	})
})();