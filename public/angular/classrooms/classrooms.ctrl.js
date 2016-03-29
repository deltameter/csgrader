(function(){
	angular.module('classrooms')
	.controller('ClassroomController', function($stateParams, $http, ClassroomFactory){
		var vm = this;
		vm.classroom = {};
		vm.newStudent = {};

		var getClassroom = function(){
			ClassroomFactory.getClassroom($stateParams.courseCode, $stateParams.classCode).then(
				function Success(res){
					vm.classroom = res;
				}
			);
		}

		this.createStudent = function(){
			ClassroomFactory.createStudent($stateParams.courseCode, $stateParams.classCode, vm.newStudent).then(
				function Success(res){
					vm.classroom.students.push(res);
					vm.newStudent = {};
				}
			)
		}

		this.deleteStudent = function(studentID){
			ClassroomFactory.deleteStudent($stateParams.courseCode, $stateParams.classCode, studentID).then(
				function Success(res){
					for(var i = 0; i < vm.classroom.students.length; i++){
						if (vm.classroom.students[i]._id === studentID){
							vm.classroom.students.splice(i, 1);
							break;
						}
					}
				}
			)
		}

		getClassroom();
	})

	.controller('ClassroomsController', function($stateParams, ClassroomFactory){
		var vm = this;
		vm.courseCode = $stateParams.courseCode;
		vm.classrooms = [];
		vm.newClassroomName = '';
		vm.deleteClassCode = '';

		var getClassrooms = function(){
			ClassroomFactory.getClassrooms($stateParams.courseCode).then(
				function Success(res){
					vm.classrooms = res;
				}
			)
		}

		this.createClassroom = function(){
			ClassroomFactory.createClassroom($stateParams.courseCode, vm.newClassroomName).then(
				function Success(res){
					vm.classrooms.push(res);
					vm.newClassroomName = '';
				}
			)
		}

		this.deleteClassroom = function(classCode){
			//Must be clicked twice to actually delete
			if (vm.deleteClassCode === classCode){
				ClassroomFactory.deleteClassroom($stateParams.courseCode, vm.deleteClassCode).then(
					function Success(res){
						for(var i = 0; i < vm.classrooms.length; i++){
							if (vm.classrooms[i].classCode === classCode){
								vm.classrooms.splice(i, 1);
								break;
							}
						}
					}
				)
			}else{
				vm.deleteClassCode = classCode;
			}
		}

		getClassrooms();
	})
})();