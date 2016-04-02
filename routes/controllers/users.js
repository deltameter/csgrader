'use strict';

var mongoose = require('mongoose'),
	User = require(__base + 'routes/services/user'),
	Email = require(__base + 'routes/services/email'),
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
	User.create(req, req.body, function(err){
		if (err){ return helper.sendError(res, 400, err); }

		Email.sendActivationEmail(req.user, function(err, activationCode){
			if (err){ return helper.sendError(res, 500, err); }

			//do this so we can easily test if the email activation works.
			if (config.env === 'test'){
				return helper.sendSuccess(res, { activationCode: activationCode });
			}
			return helper.sendSuccess(res, User.safeSend(req.user));
		});
	})
}

module.exports.emailActivation = function(req, res){
	User.activate(req.user, req.body.activationCode, function(err){
		if (err) { helper.sendError(res, 400, err); }
		return helper.sendSuccess(res);
	});
}
