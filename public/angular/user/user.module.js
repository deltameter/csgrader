(function(){
	var app = angular.module('user', [])
	.run(function($http, Session){
		$http.get('/profile')
		.success(function(res){
			Session.create(res);
		})
		.error(function(res){
			console.log('hello');
			Session.setCurrentUser({user:'hello'});
		});
	});
})();