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
	return err;
/*	//If it isn't a mongoose-validation error, just throw it.
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

	return errors;*/
}