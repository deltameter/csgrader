'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	local = require('./passport/local');

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
		done(null, user._id)
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	//strategies for authentication
	passport.use(local);
}