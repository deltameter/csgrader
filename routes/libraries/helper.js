var config = require(__base + 'app/config'),
	errors = require('./errors')
	async = require('async');
	
var errorList = {
	1000: 'Database Error',
	1001: 'Model Error',
	2000: 'Authenticate User',
	2001: 'Authenticate Teacher',
	2002: 'Authenticate Enrollment',
	3000: 'User Input Error',
	3001: 'More Info Required'
}

module.exports.sendSuccess = function(res, obj){
	if (obj){
		return res.status(200).json(obj);
	}

	return res.sendStatus(200);
}

module.exports.sendError = function(res, httpStatus, err){
	var msg = errors.parseErr(err);
	
	return res.status(httpStatus).json({msg: msg});
}