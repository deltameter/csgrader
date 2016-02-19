'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	async = require('async'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.getSelf = function(req, res){
	return res.json(User.safeSend(req.user));
}

module.exports.logout = function(req, res){
	req.logout();
	return res.sendStatus(200);
}

module.exports.signedIn = function(req, res){
	return res.sendStatus(200);
}

module.exports.create = function(req, res){
	var newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: req.body.password,
		email: req.body.email.toLowerCase()
	});

	if (typeof req.body.accountType == 'undefined' || req.body.accountType.length <= 0){
		return helper.sendError(res, 400, 3000, 'Please select an account type.');
	}else{
		newUser.bIsTeacher = (req.body.accountType == 'teacher' ? true : false);
	}

	if (req.body.password !== req.body.retypePassword || !User.validPassword(req.body.password)){
		return helper.sendError(res, 400, 3000, 'Passwords must match.');
	}

	newUser.save(function(err, user){
		if (err){
			helper.sendError(res, 400, 1001, helper.errorHelper(err));
		}else{
			req.logIn(user, function(err){
				return module.exports.sendActivationEmail(req, res);
			});
		}
	});
}

module.exports.sendActivationEmail = function(req, res){
	//makes it easier so we don't have to check email every time
	if (config.env === 'dev'){
		req.user.bHasActivatedAccount = true;
		req.user.save();
		return helper.sendSuccess(res, User.safeSend(req.user));
	}

	var emailData = {
		recipient: req.user.email,
		sender: 'activation@csgoschool.com',
		subject: 'Welcome!',
		templateID: config.sendgrid.activationEmailTemplateID
	};

	helper.sendEmail(req.user, emailData, function(err, activationCode){
		if (err) return helper.sendError(res, 500, 3000, helper.errorHelper(err));
		//do this so we can easily test if the email activation works.
		if (config.env === 'test'){
			return res.status(200).json({ activationCode: activationCode });
		}
		return helper.sendSuccess(res, User.safeSend(req.user));
	});
}

module.exports.emailActivation = function (req, res){
	if (req.user.emailAccessCode == req.body.activationCode){
		req.user.bHasActivatedAccount = true;
		req.user.save(function(err){
			helper.sendSuccess(res);
		});
	}else{
		return helper.sendError(res, 400, 3000, 'Invalid activation link. Please try again.');
	}
}
