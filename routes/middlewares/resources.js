var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.loadSpecificClass = function(req, res, next){
	const course = res.locals.course;
	var classroomIndex = -1;

	for(var i = 0; i < course.classrooms.length; i++){
		if (course.classrooms[i].classCode === req.params.classCode){
			classroomIndex = i;
			break;
		}
	}

	if (classroomIndex === -1){
		return helper.sendError(res, 400, 300, 'That class was not found.');
	}

	res.locals.classroom = course.classrooms[classroomIndex];
	res.locals.classroomIndex = classroomIndex;
	return next();
}