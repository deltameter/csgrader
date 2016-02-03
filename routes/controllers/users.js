'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	async = require('async'),
	config = require(__base + 'app/config'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.signedIn = function(req, res){
	res.redirect(req.session.returnTo || '/');
}

module.exports.showProfile = function(req, res){
	res.locals.user = req.user;
	return res.render('pages/user/profile.ejs');
}

module.exports.showJoinPage = function(req, res){
	return res.render('pages/user/join.ejs', { user: new User() });
}

module.exports.create = function(req, res){
	var newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		username: req.body.username,
		password: req.body.password,
		email: req.body.email
	});

	if (typeof req.body.accountType == 'undefined'){
		return res.render('pages/user/join.ejs', { message: 'Please select an account type', user: newUser });
	}else{
		newUser.bIsTeacher = (req.body.accountType == 'teacher' ? true : false);
	}

	if (req.body.password !== req.body.retypePassword || !User.validPassword(req.body.password)){
		return res.render('pages/user/join.ejs', { message: 'Invalid or non-matching passwords', user: newUser });
	}

	newUser.save(function(err, user){
		if (err){
			return res.render('pages/user/join.ejs', { message: helper.errorHelper(err), user: newUser });
		}else{
			req.logIn(user, function(err){
				return module.exports.sendActivationEmail(req, res);
			});
		}
	});
}

module.exports.sendActivationEmail = function(req, res){
	if (config.env != 'production'){
		req.user.bHasActivatedAccount = true;
		req.user.save();
		return res.redirect('/profile');
	}
	
	require('crypto').randomBytes(12, function(ex, buf) {
		var activationString = buf.toString('hex');

		//Send the email and save the email activation string.
		async.parallel([
			function(callback){
				var emailData = {
					recipient: req.user.email,
					sender: 'activation@csgoschool.com',
					subject: 'Welcome!',
					html: '<a href="' + config.appLocation + 
						'/profile/activate/' + activationString + '">Click here to activate your account!</a>',
					templateID: config.sendgrid.activationEmailTemplateID
				};

				helper.sendEmail(emailData, callback);
			},
			function(callback){
				req.user.emailAccessCode = activationString;
				req.user.save(function(err){
					callback(err, null);
				});
			}
		], function(err, results){
			if (err) console.log(err);
			return res.redirect('/profile/activate');
		});
	});
}

module.exports.showActivationInstructions = function(req, res){
	return res.render('pages/user/activationInstructions.ejs');
}

module.exports.emailActivation = function (req, res){
	if (req.user.emailAccessCode == req.params.activationString){
		req.user.bHasActivatedAccount = true;
		req.user.save(function(err){
			res.redirect('/profile');
		});
	}else{
		return res.render('pages/user/activationInstructions.ejs', { message: "Invalid activation link." });
	}
}
