var helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated()) return next();
	if (req.method == 'GET') req.session.returnTo = req.originalUrl;
	return helper.gener(res, 401, 'Unauthorized');
}
