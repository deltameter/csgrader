'use strict';

var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');

module.exports = new LocalStrategy({ usernameField: 'email' }, function (email, password, done){
	User.findOne({email: email.toLowerCase()}, function(err, user){
		//uh oh
		if (err) return done(err);
		//check if there is a user by that name
		if (!user){
			return done(null, false, { message: 'Incorrect username.'})
		}
		//check if the user has the correct password
		user.checkPassword(password, function(err, bIsPassword){
			if (err) return done(err);
			if (!bIsPassword) {
				return done(null, false, { message: 'Incorrect password.'})
			}
			return done(null, user);
		});
	});
});