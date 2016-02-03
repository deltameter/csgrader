'use strict';
const fs = require('fs');
const dev = fs.readFileSync(__dirname + '/env/dev.json');

if (process.env.NODE_ENV == 'production'){
	
}else if (process.env.NODE_ENV == 'test'){
	var testEnv = JSON.parse(dev);
	testEnv.env = 'test';
	testEnv.mongoURL = 'mongodb://localhost/csgradertest';
	module.exports = testEnv;
}else{
	module.exports = JSON.parse(dev);
}