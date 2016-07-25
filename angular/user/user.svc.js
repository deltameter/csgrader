(function(){
	angular.module('user').factory('UserFactory', function ($http) {
		return {
			registerForCourse: registerForCourse
		}

		function registerForCourse(regInfo){
			return $http.put('/api/course/register', regInfo).then(
				function Success(res){
					return res.data;
				},
				function Failure(res){
					return res.data;
				}
			)
		}
	})
	
	.factory('AuthService', function ($http, UserInfo) {
		return {
			login: login,
			signup: signup,
			isAuthenticated: isAuthenticated,
			retrieveProfile: retrieveProfile
		};

		function login(credentials) {
			return $http
			.post('/auth/local', credentials)
			.then(function (res) {
				UserInfo.setUser(res.data);
				return res.data;
			});
		};

		function signup(newUser){
			return $http.post('/api/user/join', newUser).then(
				function(res){
					UserInfo.setUser(res.data);
					return res.data;
				}
			);
		};

		function retrieveProfile(){
			$http.get('/api/user').then(
				function Success(res){
					UserInfo.setUser(res.data);
				},
				function Failure(res){
					UserInfo.setUser({});
				}
			);
		}

		function isAuthenticated(){
			return UserInfo.live();
		};
	})

	.factory('UserInfo', function ($rootScope) {
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
			$rootScope.currentUser = {};
		};
	})

	.factory('AuthResolver', function($q, $rootScope, $state) {
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
	})
})();