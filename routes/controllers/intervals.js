var mongoose = require('mongoose'),
	Assignment = mongoose.model('Assignment');

function closeAssignments = function(){
	Assignment.find({ dueDate: { $lt: Date.now() }}, { bIsOpen: false }, { multi: true }, function(err, raw){
		console.log('closeAssignments interval -----------------');
		console.log('err: ' + err);
		console.log('mongodb response' + raw);
		console.log('-------------------------------------------');
	})
}

//Check every 5 minutes
setInterval(closeAssignments, 60 * 60 * 5);