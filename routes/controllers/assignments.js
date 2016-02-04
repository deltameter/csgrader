var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.showAssignment = function(req, res){
	var aIndex = parseInt(req.params.assignmentID, 10);

	if (typeof res.locals.course.assignments[aIndex] == 'undefined'
		|| !res.locals.course.assignments[aIndex].bIsOpen){
		return res.render('pages/general/unauthorized.ejs');
	}

	res.locals.assignment = res.locals.course.assignments[req.params.assignmentID];

	if (req.user.bIsTeacher){
		return res.render('pages/assignment/assignmentTeacher.ejs');
	}else{
		return res.render('pages/assignment/assignmentStudent.ejs');
	}
}