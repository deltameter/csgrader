(function(){
	var app = angular.module('user', [])
	.run(function($http, Session){
		$http.get('/profile')
		.success(function(res){
			Session.create(res);
		})
		.error(function(res){
			Session.setCurrentUser({user:'hello'});
		});
	});
})();