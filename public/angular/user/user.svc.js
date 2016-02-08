(function(){
	angular.module('user').factory('AuthService', function ($http, Session) {
		var authService = {};

		authService.login = function (credentials) {
			return $http
			.post('/auth/local', credentials)
			.then(function (res) {
				Session.create(res.data);
				return res.data;
			});
		};

		authService.isAuthenticated = function () {
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
		return {
			resolve: function () {
				console.log('asdf')
				var deferred = $q.defer();
				var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
					console.log('whwat');
					if (angular.isDefined(currentUser)) {
						console.log('hmm');
						if (currentUser) {
							deferred.resolve(currentUser);
						} else {
							deferred.reject();
							$state.go('login');
						}
						unwatch();
					}
				});
				return deferred.promise;
			}
		};
	});
})();