//Set up a base path to make require(...) easier
global.__base = __dirname + '/';

//-------------------------------
//Create our web app
//-------------------------------
var express = require('express');
var app = express();
var passport = require('passport');


require('./app/database');
require('./app/passport')(passport);
require('./app/app')(app, passport);
require('./app/router')(app, passport);

//Used for integration tests
module.exports.app = app; 

//-------------------------------
//Create the actual web server
//-------------------------------
var http = require('http');

var port = 3000;
app.set('port', port);

var server = http.createServer(app);

server.listen(port);

console.log('Server running on port 3000');