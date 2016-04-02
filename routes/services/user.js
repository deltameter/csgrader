'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	async = require('async'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

module.exports.safeSend = function(user){
	return user;
}

module.exports.create = function(req, userInfo, callback){
	var newUser = new User({
		firstName: userInfo.firstName,
		lastName: userInfo.lastName,
		password: userInfo.password,
		email: userInfo.email.toLowerCase()
	});

	if (typeof userInfo.accountType == 'undefined' || userInfo.accountType.length <= 0){
		return callback(new DescError('Please select an account type'), 400);
	}else{
		newUser.bIsTeacher = (userInfo.accountType == 'teacher' ? true : false);
	}

	if (userInfo.password !== userInfo.retypePassword || !User.validPassword(userInfo.password)){
		return callback(new DescError('Passwords must match.'), 400);
	}

	newUser.save(function(err, user){
		if (err){ return callback(err) }

		req.logIn(user, function(err){
			return callback(null);
		});
	});
}

module.exports.activate = function(user, activationCode, callback){
	if (typeof user === 'undefined'){
		return callback(new DescError('You are not logged in!', 401));
	}else if (user.emailAccessCode == activationCode){
		user.bHasActivatedAccount = true;
		user.save(function(err){
			return callback(null);
		});
	}else{
		return callback(new DescError('Invalid activation code'), 400);
	}
}