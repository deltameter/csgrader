'use strict';
const fs = require('fs');

if (process.env.NODE_ENV == 'production'){
	const prod = fs.readFileSync(__dirname + '/env/prod.json');
	module.exports = JSON.parse(prod);
}else if (process.env.NODE_ENV == 'test'){
	const test = fs.readFileSync(__dirname + '/env/test.json');
	module.exports = JSON.parse(test);
}else{
	const dev = fs.readFileSync(__dirname + '/env/dev.json');
	module.exports = JSON.parse(dev);
}