'use strict';

module.exports.showIndex = function(req, res){
	if (res.locals.bIsAuthenticated){
		return res.redirect('/dashboard');
	}else{
		return res.render('pages/general/index.ejs');
	}
}