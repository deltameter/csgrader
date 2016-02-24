(function(){
	angular.module('user').factory('AuthService', function ($http, UserFactory) {

		return {
			login: login,
			signup: signup,
			isAuthenticated: isAuthenticated
		};

		function login(credentials) {
			return $http
			.post('/auth/local', credentials)
			.then(function (res) {
				UserFactory.setUser(res.data);
				return res.data;
			});
		};

		function signup(newUser){
			return $http
			.post('/api/user/join', newUser)
			.then(
			function(res){
				UserFactory.setUser(res.data);
				return res.data;
			}, function(res){
				return res.data;
			});
		};

		function isAuthenticated(){
			return UserFactory.live();
		};
	});

	angular.module('user').factory('UserFactory', function ($rootScope) {
		return {
			live: live,
			setUser: setUser,
			getUser: getUser,
			destroyUser: destroyUser
		}

		function live(){
			return (Object.keys($rootScope.currentUser).length > 0);
		}

		function setUser(user){
			$rootScope.currentUser = user;
		};

		function getUser(){
			return $rootScope.currentUser;
		}

		function destroyUser(){
			$rootScope.currentUser = null;
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