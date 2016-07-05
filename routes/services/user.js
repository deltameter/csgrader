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
		email: userInfo.email.toLowerCase(),
		role: userInfo.role
	});

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

module.exports.addCourse = function(user, userID, courseID, callback){
	function addCourse(user, courseID, callback){
		user.courses.push(courseID);
		user.save(function(err, user){
			if (err) return callback(err, null);
			return callback(null, courseID);
		});
	}

	if (typeof user != 'null'){
		addCourse(user, courseID, callback);
	}else{
		User.findOne({ _id: userID }, function(err, user){
			addCourse(user, courseID, callback);
		});
	}
}

module.exports.removeCourse = function(user, userID, courseID, callback){
	function removeCourse(user, courseID, callback){
		var courseIndex = user.courses.indexOf(courseID);
		user.courses.splice(courseIndex, 1);
		user.markModified('courses');
		user.save();

		return callback(err);
	}

	if (user !== null){
		removeCourse(user, courseID, callback);
	}else{
		User.findOne({ _id: userID }, function(err, user){
			removeCourse(user, courseID, callback);
		});
	}
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