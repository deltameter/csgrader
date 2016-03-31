var mongoose = require('mongoose'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.loadSpecificClass = function(course, classCode){
	var classroomIndex = -1;

	for(var i = 0; i < course.classrooms.length; i++){
		if (course.classrooms[i].classCode === classCode){
			classroomIndex = i;
			break;
		}
	}

	if (classroomIndex === -1){
		return helper.sendError(res, 400, 300, 'That class was not found.');
	}

	return {
		classroom: course.classrooms[classroomIndex],
		classroomIndex: classroomIndex
	}
}