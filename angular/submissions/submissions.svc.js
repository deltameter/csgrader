(function(){
	angular.module('submissions')
	.factory('SubmissionsFactory', function ($http) {
		var courseCode = '';
		var assignmentID = '';

		return {
			setParams: setParams,
			getClassesWithProgress: getClassesWithProgress,
			getSubmissions: getSubmissions
		}

		function setParams(setCourseCode, setAssignmentID){
			courseCode = setCourseCode;
			assignmentID = setAssignmentID;
		}

		function getClassesWithProgress(regInfo){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission').then(
				function Success(res){
					return res.data;
				}
			)
		}

		function getSubmissions(classCode){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission/' + classCode).then(
				function Success(res){
					return res.data;
				}
			)
		}
	})
})();