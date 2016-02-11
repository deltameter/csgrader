'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
	async = require('async'),
	validator = require('validator');

var SALT_LEVELS = 10;

var userSchema = new Schema({
	//Meta info
	bIsTeacher: Boolean,
	bHasActivatedAccount: { type: Boolean, default: false },
	emailAccessCode: String,
	bIsBanned: { type: Boolean, default: false },

	//Authentication
	password: String,
	email: { type: String, required: true, index: true, unique: true },

	//Information
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	fullNameLower: { type: String, index: true }, //used for searches
	
	//Courses the user is taking or teaching
	courses: [Schema.Types.ObjectId],

	//courses the user has taken or has taught
	archivedCourses: [Schema.Types.ObjectId]
	
	//Teacher specific

	//Student specific
});

userSchema.path('firstName').validate(function(firstName){
	return firstName.length > 0 && firstName.length <= 25;
}, 'First name must be between 1 and 25 characters long.');

userSchema.path('lastName').validate(function(lastName){
	return lastName.length > 0 && lastName.length <= 25;
}, 'Last name must be between 1 and 25 characters long');

userSchema.path('courses').validate(function(courses){
	return courses.length <= 10;
}, 'The maximum amount of courses you can be affiliated with is 10.');

userSchema.path('email').validate(function(email){
	return validator.isEmail(email);
}, 'Email must be valid');

userSchema.pre('save', function(next){
	var user = this;

	async.parallel([
		//Password encryption
		function(callback){
			if (user.isModified('password')){
				bcrypt.genSalt(SALT_LEVELS, function(err, salt){
					if (err) return next(err);
					//encrypt this shit
					bcrypt.hash(user.password, salt, function(err, hashedPassword){
						if (err) return next(err);
						//fuck u nsa Kappa
						user.password = hashedPassword;
						callback(null, null);
					});
				});
			}else{
				callback(null, null);
			}
		},
		//Make a lowercase firstname for easier queries
		function(callback){
			if (user.isModified('firstName') || user.isModified('lastName')){
				user.fullNameLower = user.firstName.toLowerCase() + ' ' + user.lastName.toLowerCase();
			}

			if (user.isModified('email')){
				user.email = user.email.toLowerCase();
			}
			
			callback(null, null);
		}
	],
	function(err, results){
		return next();
	});
});

//Used to authenticate users
userSchema.methods = {
	checkPassword: function(passwordToCheck, cb){
		bcrypt.compare(passwordToCheck, this.password, function(err, bIsPassword){
			if (err) return cb(err);
			cb(null, bIsPassword)
		})
	}
}

userSchema.statics = {
	safeSend: function(user){
		return {
			bIsTeacher: user.bIsTeacher,
			firstName: user.firstName,
			lastName: user.lastName,
			courses: user.courses
		}
	},

	validPassword: function(password){
		return password.length >= 8 && password.length <= 50;
	},
	properties: function(user){
		maxCourses: 10
	}
}

mongoose.model('User', userSchema);
