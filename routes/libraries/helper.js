var util = require('util'),
	config = require(__base + 'app/config'),
	sendgrid = require('sendgrid')(config.sendgrid.apiKey);
	
module.exports.errorHelper = function(err) {

	//If it isn't a mongoose-validation error, just throw it.
	if (err.name !== 'ValidationError')
		return err

	var messages = {
		'required' : '%s is required',
		'min': '%s below minimum',
		'max': '%s above maximum',
		'enum': '%s not an allowed value'
	};

	//A validationerror can contain more than one error.
	var errors = [];

	//Loop over the errors object of the Validation Error
	Object.keys(err.errors).forEach(function (field) {
		// Getting from .proprerties now.
		var eObj = err.errors[field].properties;

		// If we have a message on the schema.
		if(eObj.type == 'user defined') errors.push(eObj.message);

		//If we don't have a message for `type`, just push the error through
		else if (!messages.hasOwnProperty(eObj.type)) errors.push(eObj.type);

		//Otherwise, use util.format to format the message, and passing the path
		else errors.push(util.format(messages[eObj.type], eObj.path));
	});

	return errors;
}

module.exports.sendEmail = function(emailData, callback){
	var email = new sendgrid.Email({
		to: emailData.recipient,
		from: emailData.sender,
		subject: emailData.subject,
		html: emailData.html
	});

	//Use our filter
	email.addFilter('templates', 'enable', 1);
	email.addFilter('templates', 'template_id', emailData.templateID);

	sendgrid.send(email, function(err){
		callback(err, null);
	});
}

module.exports.sendError = function(res, errorCode, errorMessage){
	var error = {
		error: errorCode,
		message: errorMessage
	}

	return res.send(error);
}