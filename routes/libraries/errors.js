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
	//A validation err from express-validator
	if (Array.isArray(err)){
		var errorString = '';
		for (var i = 0; i < err.length; i++){
			errorString += err[i].msg;
			errorString += '\n';
		}
		err = errorString;
	}

	return err;
}