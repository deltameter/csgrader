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
	var userMessages = []; 

	//A validation err from express-validator
	if (Array.isArray(err)){
		userMessages = err.map(function(error){ return error.msg });
	}

	//a desc err
	else if (err instanceof DescError){
		userMessages.push(err.message);
	}

	//defined validation error by us
	else if (err.name == 'ValidationError'){
		for (errField in err.errors){
			if (typeof err.errors[errField].message !== 'undefined'){
				userMessages.push(err.errors[errField].message);
			}
		}
	}

	//if they create or save something and it violates the "unique" constraint
	else if (err.code === 11000 || err.code === 11001){
		//basically just gets the field because mongo doesnt do that for use
		var field = err.message.split('$', 2)[1].split(' ', 2)[0].split('_')[0];

		userMessages.push('Your ' + field + ' is not unique.');
	}

	//something really went wrong
	else{
		console.log('-------------------------------')
		console.log('ERROR')
		console.log(err);
		console.log('-------------------------------')

		userMessages.push('Uh oh. Something went wrong. Please try again or contact an admin.')
	}

	return userMessages;
}