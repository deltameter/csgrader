(function(){
	angular.module('user').controller('LoginController', function($state, $rootScope, AuthService){
		var vm = this;
		
		vm.authMessage = '';
		vm.user = {
			email: '',
			password: ''
		};

		this.login = function() {
			AuthService.login(vm.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					vm.authMessage = res.data.userMessage;
				});
		};
	})

	.controller('LogoutController', function($http, $state, UserInfo){
		//Logout and reset user
		$http.post('/api/user/logout').then(
			function Success(){
				UserInfo.destroyUser();
				$state.go('root.main.public');
			}
		)
	})
	
	.controller('JoinController', function($state, $rootScope, AuthService){
		var vm = this;
		vm.authMessage = '';
		vm.user = {
			firstName: '',
			lastName: '',
			retypePassword: '', 
			password: '',
			email: '',
			role: ''
		};

		this.signup = function() {
			AuthService.signup(vm.user).then(
				function Success(res){
					$state.go('root.main');
				},
				function Failure(res){
					console.log(res.data.userMessage);
					vm.authMessage = res.data.userMessage;
				}
			);
		};
	})

	.controller('RegistrationController', function($state, UserFactory){
		var vm = this;
		vm.regInfo = {};
		vm.userMessage = '';

		this.registerForCourse = function(){
			UserFactory.registerForCourse(vm.regInfo).then(
				function Success(res){
					console.log(res);
					$state.go('root.course', { courseCode: res.courseCode });
				},
				function Failure(res){
					console.log(res);
					vm.userMessage = res.data.userMessage;
				}
			)
		}
	})

	.controller('ProfileController', function($state, UserInfo){
		this.user = UserInfo.getUser();
	});
})();