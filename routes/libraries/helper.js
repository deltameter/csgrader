var util = require('util'),
	config = require(__base + 'app/config'),
	async = require('async'),
	sendgrid = require('sendgrid')(config.sendgrid.apiKey);
	
var errorList = {
	1000: 'Database Error',
	1001: 'Model Error',
	2000: 'Authenticate User',
	2001: 'Authenticate Teacher',
	2002: 'Authenticate Enrollment',
	3000: 'User Input Error'
}

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

		// Michael: crash fix. Redo this entire function tbh FAMILIAS;
		if (err.errors[field].name === 'CastError'){
			return errors.push('Wrong type of input on ' + err.errors[field].path);
		}

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

module.exports.sendEmail = function(user, emailData, callback){
	//create random characters to send as email code
	require('crypto').randomBytes(12, function(ex, buf) {
		var emailAccessCode = buf.toString('hex');

		//Send the email and save the email activation string.
		async.parallel([
			function(callback){
				if (config.env === 'production'){
					var email = new sendgrid.Email({
						to: emailData.recipient,
						from: emailData.sender,
						subject: emailData.subject,
						html: '<p>' + emailAccessCode + '</p>'
					});

					//Use our filter
					email.addFilter('templates', 'enable', 1);
					email.addFilter('templates', 'template_id', emailData.templateID);

					sendgrid.send(email, function(err){
						callback(err, null);
					});
				}else{
					callback(null);
				}
			},
			function(callback){
				user.emailAccessCode = emailAccessCode;
				user.save(function(err){
					callback(err, null);
				});
			}
		], function(err, results){
			callback(err, emailAccessCode);
		});
	});
}

module.exports.sendSuccess = function(res, obj){
	if (obj){
		return res.status(200).json(obj);
	}

	return res.sendStatus(200);
}

module.exports.sendError = function(res, httpStatus, errorCode, userMessage){
	var error = {
		errorCode: errorCode,
		errorMessage: errorList[errorCode.toString()],
		userMessage: userMessage
	}

	return res.status(httpStatus).json(error);
}