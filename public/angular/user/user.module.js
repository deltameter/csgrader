(function(){
	var app = angular.module('user', [])
	.run(function($http, UserFactory){
		$http.get('/api/profile')
		.success(function(res){
			UserFactory.setUser(res);
		})
		.error(function(res){
			UserFactory.setUser({});
		});
	});
})();