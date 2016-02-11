var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var studentSchema = new Schema({
	userID: Schema.Types.ObjectId,
	gradebookID: { type: String, required: true },  
	firstName: { type: String, required: true },
	lastName: { type: String, required: true }
});

mongoose.model('Student', studentSchema);