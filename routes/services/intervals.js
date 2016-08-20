var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment'),
	User = mongoose.model('User'),
	Submission = mongoose.model('Submission'),
	Course = mongoose.model('Course');

const minutes = 60 * 1000;
const hours = 60 * minutes;
const days = 24 * hours;

function closeAssignments(){
	Assignment.find({ dueDate: { $lt: Date.now() }, bIsOpen: true }, { courseID: 1 }, function(err, assignments){
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

function deleteUsers(){
	User.remove({ bHasActivatedAccount: false, createDate: { $lt: Date.now() - 7 * days }}, function(err, raw){
		console.log('----------- deleteUsers interval ----------');
		console.log('err: ' + err);
		console.log('raw:')
		console.log(raw.result)
		console.log('-------------------------------------------');
	})
}

closeAssignments();
setInterval(closeAssignments, 5 * minutes);

deleteUsers()
setInterval(deleteUsers, 12 * hours);