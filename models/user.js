'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
	async = require('async'),
	validator = require('validator'),
	config = require(__base + '/app/config'),
	DescError = require(__base + 'routes/libraries/errors').DescError;

var SALT_LEVELS = 10;

const roles = 'student teacher aide'.split(' ');

var userSchema = new Schema({
	//Meta info
	role: { type: String, enum: roles },
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
	archivedCourses: [Schema.Types.ObjectId],
	
	//Teacher specific

	//Student specific

	//rate limit the # of times a user can submit in a certain time
	exerciseSubmissionAllowance: { type: Number, default: 10 },
	exerciseRateLastCheck: { type: Date, default: Date.now() }
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

userSchema.statics = {
	properties: {
		maxCourses: 10,
		exerciseAllowanceMax: config.exerciseRateLimiting.max,
		exerciseSubmissionRate: config.exerciseRateLimiting.rate,
		exerciseSubmissionPer: config.exerciseRateLimiting.per
	},

	validPassword: function(password){
		return password.length >= 8 && password.length <= 50;
	},

	create: function(userInfo, callback){
		var User = this;

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
			return callback(err, user);
		});
	},

	findByID: function(userID, callback){
		var User = this;
		User.findOne({ _id: userID }, function(err, user){
			if (err){ return callback(err) }
			if (!user){ return callback(new DescError('That user was not found'), 400); }
			return callback(null, user);
		})
	}
}

//Used to authenticate users
userSchema.methods = {
	checkPassword: function(passwordToCheck, callback){
		bcrypt.compare(passwordToCheck, this.password, function(err, bIsPassword){
			if (err) return cb(err);
			callback(null, bIsPassword)
		})
	},

	safeSend: function(user){
		return {
			_id: this._id,
			role: this.role,
			bHasActivatedAccount: this.bHasActivatedAccount,
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			courses: this.courses
		}
	},

	activate: function(activationCode, callback){
		var user = this;

		if (user.emailAccessCode == activationCode){
			user.bHasActivatedAccount = true;
			user.save(function(err){
				return callback(null);
			});
		}else{
			return callback(new DescError('Invalid activation code'), 400);
		}
	},

	addCourse: function(courseID){
		var user = this;
		user.courses.push(courseID);
	},

	removeCourse: function(courseID){
		var user = this;
		var courseIndex = user.courses.indexOf(courseID);
		user.courses.splice(courseIndex, 1);
		user.markModified('courses');
	},

	/*
		@description: calculates whether a user can submit an exercise based off of rate limiting
	*/

	isRateLimited: function(){
		var user = this;
		const rate = user.constructor.properties.exerciseSubmissionRate;
		const per = user.constructor.properties.exerciseSubmissionPer;
		const max = user.constructor.properties.exerciseAllowanceMax;
		const currentTime = Date.now()

		user.exerciseSubmissionAllowance += (rate / per) * ((currentTime-user.exerciseRateLastCheck) / 1000);

		if (user.exerciseSubmissionAllowance > max){
			user.exerciseSubmissionAllowance = max;
		}

		if (user.exerciseSubmissionAllowance >= 1){
			user.exerciseSubmissionAllowance -= 1;
			user.exerciseRateLastCheck = currentTime;
			user.save();
			return false;
		}else{
			return true;
		}
	}
}


mongoose.model('User', userSchema);
