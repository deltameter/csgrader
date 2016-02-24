(function(){
	angular.module('assignments').factory('AssignmentFactory', function($http) {
		return {
			createAssignment: createAssignment
		};

		function createAssignment(courseCode, newAssignment){
			return $http.post('/api/course/' + courseCode + '/assignment/create', newAssignment);
		};
	});
})();