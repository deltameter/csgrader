var util = require('util');

function DescError(message, errorCode){
	this.name = 'DescError';
	this.message = message || 'I should have left a message here';
	this.code = errorCode; 
	this.stack = (new Error()).stack;
}

DescError.prototype = Object.create(Error.prototype);
DescError.prototype.constructor = DescError;

module.exports.DescError = DescError;

module.exports.parseErr = function(err) {
	var userMessage; 
	//A validation err from express-validator
	if (Array.isArray(err)){
		for (var i = 0; i < err.length; i++){
			userMessage += err[i].msg;
			userMessage += '\n';
		}
	}

	//a desc err
	else if (err instanceof DescError){
		userMessage = err.message;
	}

	return userMessage;
}