'use strict';

var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	config = require('./config'),
	session = require('express-session'),
	mongoStore = require('connect-mongo')(session);

module.exports = function(app, passport){
	var sessionStore = new mongoStore({url: config.mongoURL});

	var sessionMiddleware = session({
		secret: 'salveimperator', 
		cookie: { maxAge: 3 * 24 * 60 * 60 * 1000 }, //users don't have to sign in for 3 days
		rolling: true,
		saveUninitialized: true,
		resave: true,
		store: sessionStore
	});

	// view engine setup
	app.set('views', path.join(__base, '/views'));
	app.set('view engine', 'ejs');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static(path.join(__base, '/public')));
	app.use(sessionMiddleware);
	app.use(passport.initialize());
	app.use(passport.session());

	//Lets views access authentication status
	app.use(function (req, res, next) {
		res.locals.bIsAuthenticated = req.isAuthenticated();
		return next();
	});
};