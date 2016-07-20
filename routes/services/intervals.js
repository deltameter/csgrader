var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	Course = mongoose.model('Course');

const minutes = 60 * 1000;

function closeAssignments(){
	Assignment.find({ dueDate: { $lt: new Date(2020, 11, 17, 3, 24, 0) }, bIsOpen: true }, { courseID: 1 }, function(err, assignments){
		console.log('-------- closeAssignments interval --------');
		console.log('err: ' + err);
		console.log('-------------------------------------------');

		assignments.forEach(function(assignment){
			assignment.close();
			assignment.save();

			//yank out open assignments from the courses themselves.
			Course.findByIdAndUpdate(assignment.courseID, { $pull: { openAssignments: { assignmentID : assignment._id } } })
		})
	})
}

closeAssignments();
setInterval(closeAssignments, 5 * minutes);