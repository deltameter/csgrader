(function(){
	angular.module('user').factory('AuthService', function ($http, Session) {
		var authService = {};
		var user = {};

		authService.login = function(credentials) {
			return $http
			.post('/auth/local', credentials)
			.then(function (res) {
				Session.create(res.data);
				return res.data;
			});
		};

		authService.signup = function(newUser){
			return $http
			.post('/api/user/join', newUser)
			.then(
			function Success(res){
				console.log(res.data);
				Session.create(res.data);
				return res.data;
			}, function Failure(res){
				return res.data;
			});
		};

		authService.isAuthenticated = function() {
			return Session.live();
		};

		return authService;
	});

	angular.module('user').service('Session', function ($rootScope) {
		var root = this;
		this.user = {};

		this.live = function(){
			return (Object.keys(root.user).length > 0);
		}

		this.setCurrentUser = function(user){
			$rootScope.currentUser = user;
			root.user = user;
		}

		this.create = function(user){
			$rootScope.currentUser = user;
			root.user = user;
		};

		this.destroy = function () {
			$rootScope.currentUser = null;
			root.user = null;
		};
	});

	angular.module('user').factory('AuthResolver', function($q, $rootScope, $state) {
		var bIsResolved = false;

		return {
			resolve: function () {
				var deferred = $q.defer();
				var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
					if (angular.isDefined(currentUser)) {
						if (currentUser) {
							deferred.resolve(currentUser);
						} else {
							deferred.reject();
						}
						bIsResolved = true;
						unwatch();
					}
				});
				return deferred.promise;
			},

			bIsResolved: function(){
				return bIsResolved;
			}
		};
	});
})();