var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment');

function closeAssignments(){
	Assignment.find({ dueDate: { $lt: Date.now() }}, { bIsOpen: false }, { multi: true }, function(err, raw){
		console.log('-------- closeAssignments interval --------');
		console.log('err: ' + err);
		console.log('mongodb response:' + raw);
		console.log('-------------------------------------------');
	})
}


const minutes = 60 * 1000;

closeAssignments();
setInterval(closeAssignments, 5 * minutes);