'use strict';

var config = require(__base + 'app/config'),
	async = require('async'),
	sendgrid = require('sendgrid')(config.sendgrid.apiKey);

module.exports.sendActivationEmail = function(user, callback){
	//create random characters to send as email code
	require('crypto').randomBytes(12, function(ex, buf) {
		var emailAccessCode = buf.toString('hex');

		//Send the email and save the email activation string.
		async.parallel([
			function(cb){
				if (config.env === 'production'){
					var email = new sendgrid.Email({
						to: user.email,
						from: 'activation@csgoschool.com',
						subject: 'Welcome!',
						html: '<p>' + emailAccessCode + '</p>'
					});

					//Use our filter
					email.addFilter('templates', 'enable', 1);
					email.addFilter('templates', 'template_id', config.sendgrid.activationEmailTemplateID);

					sendgrid.send(email, function(err){
						cb(err, null);
					});
				}else{
					cb(null);
				}
			},
			function(cb){
				user.emailAccessCode = emailAccessCode;
				user.save(function(err){
					cb(err, null);
				});
			}
		], function(err, results){
			callback(err, emailAccessCode);
		});
	});
}