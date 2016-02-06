'use strict';

module.exports.showIndex = function(req, res){
	return res.sendFile(__base + 'views/index.html');
}