!function(){angular.module("general",[])}(),function(){angular.module("user",[]).run(["$http","Session",function($http,Session){$http.get("/api/profile").success(function(res){Session.create(res)}).error(function(res){Session.setCurrentUser({})})}])}(),function(){var app=angular.module("grader",["ui.router","general","user"]);app.config(["$locationProvider",function($locationProvider){$locationProvider.html5Mode(!0)}]),app.run(["$rootScope","AuthService","AuthResolver",function($rootScope,AuthService,AuthResolver){$rootScope.$on("$stateChangeStart",function(event,next){AuthResolver.bIsResolved()?(console.log("stateChangeStart resolved"),console.log("auth: "+AuthService.isAuthenticated())):AuthResolver.resolve().then(function(data){console.log("stateChangeStart not resolved"),console.log("auth: "+AuthService.isAuthenticated())})})}])}(),function(){angular.module("general").controller("NavController",["$http","AuthService",function($http,AuthService){this.bLoggedIn=AuthService.isAuthenticated()}])}(),function(){angular.module("general").config(["$stateProvider",function($stateProvider){$stateProvider.state("index",{url:"/",resolve:{auth:["AuthResolver",function(AuthResolver){return AuthResolver.bIsResolved()===!0||AuthResolver.resolve()}]},controller:["$state","AuthService",function($state,AuthService){console.log("controller called"),console.log("Controller auth: "+AuthService.isAuthenticated()),AuthService.isAuthenticated()?$state.go("dashboard"):$state.go("public")}]}),$stateProvider.state("public",{url:"/",templateUrl:"/angular/general/partials/index.general.html"})}])}(),function(){angular.module("user").controller("LoginController",["$state","$rootScope","AuthService",function($state,$rootScope,AuthService){var root=this;this.authMessage="",this.user={username:"",password:""},this.login=function(){AuthService.login(root.user).then(function(res){$state.go("profile")},function(res){root.authMessage=res.data.userMessage})}}]),angular.module("user").controller("DashboardController",["$state","Session",function($state,Session){this.user=Session.user}]),angular.module("user").controller("ProfileController",["$state","Session",function($state,Session){this.user=Session.user}])}(),function(){angular.module("user").config(["$stateProvider",function($stateProvider){$stateProvider.state("login",{url:"/login",templateUrl:"/angular/user/partials/auth.user.html",controller:"LoginController",controllerAs:"loginCtrl"}),$stateProvider.state("dashboard",{url:"",templateUrl:"/angular/user/partials/dashboard.html",controller:"DashboardController",controllerAs:"dashboardCtrl"}),$stateProvider.state("profile",{url:"/profile",templateUrl:"/angular/user/partials/profile.user.html",controller:"ProfileController",controllerAs:"profileCtrl"})}])}(),function(){angular.module("user").factory("AuthService",["$http","Session",function($http,Session){var authService={};return authService.login=function(credentials){return $http.post("/auth/local",credentials).then(function(res){return Session.create(res.data),res.data})},authService.isAuthenticated=function(){return Session.live()},authService}]),angular.module("user").service("Session",["$rootScope",function($rootScope){var root=this;this.user={},this.live=function(){return Object.keys(root.user).length>0},this.setCurrentUser=function(user){$rootScope.currentUser=user},this.create=function(user){$rootScope.currentUser=user,root.user=user},this.destroy=function(){$rootScope.currentUser=null,root.user=null}}]),angular.module("user").factory("AuthResolver",["$q","$rootScope","$state",function($q,$rootScope,$state){var bIsResolved=!1;return{resolve:function(){console.log("resolve asked");var deferred=$q.defer(),unwatch=$rootScope.$watch("currentUser",function(currentUser){angular.isDefined(currentUser)&&(currentUser?deferred.resolve(currentUser):deferred.reject(),bIsResolved=!0,unwatch())});return deferred.promise},bIsResolved:function(){return bIsResolved}}}])}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdlbmVyYWwvZ2VuZXJhbC5tb2R1bGUuanMiLCJ1c2VyL3VzZXIubW9kdWxlLmpzIiwiY29yZS5qcyIsImdlbmVyYWwvZ2VuZXJhbC5jdHJsLmpzIiwiZ2VuZXJhbC9nZW5lcmFsLnJvdXRlcy5qcyIsInVzZXIvdXNlci5jdHJsLmpzIiwidXNlci91c2VyLnJvdXRlcy5qcyIsInVzZXIvdXNlci5zdmMuanMiXSwibmFtZXMiOlsiYW5ndWxhciIsIm1vZHVsZSIsInJ1biIsIiRodHRwIiwiU2Vzc2lvbiIsImdldCIsInN1Y2Nlc3MiLCJyZXMiLCJjcmVhdGUiLCJlcnJvciIsInNldEN1cnJlbnRVc2VyIiwiYXBwIiwiY29uZmlnIiwiJGxvY2F0aW9uUHJvdmlkZXIiLCJodG1sNU1vZGUiLCIkcm9vdFNjb3BlIiwiQXV0aFNlcnZpY2UiLCJBdXRoUmVzb2x2ZXIiLCIkb24iLCJldmVudCIsIm5leHQiLCJiSXNSZXNvbHZlZCIsImNvbnNvbGUiLCJsb2ciLCJpc0F1dGhlbnRpY2F0ZWQiLCJyZXNvbHZlIiwidGhlbiIsImRhdGEiLCJjb250cm9sbGVyIiwidGhpcyIsImJMb2dnZWRJbiIsIiRzdGF0ZVByb3ZpZGVyIiwic3RhdGUiLCJ1cmwiLCJhdXRoIiwiJHN0YXRlIiwiZ28iLCJ0ZW1wbGF0ZVVybCIsInJvb3QiLCJhdXRoTWVzc2FnZSIsInVzZXIiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwibG9naW4iLCJ1c2VyTWVzc2FnZSIsImNvbnRyb2xsZXJBcyIsImZhY3RvcnkiLCJhdXRoU2VydmljZSIsImNyZWRlbnRpYWxzIiwicG9zdCIsImxpdmUiLCJzZXJ2aWNlIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImN1cnJlbnRVc2VyIiwiZGVzdHJveSIsIiRxIiwiZGVmZXJyZWQiLCJkZWZlciIsInVud2F0Y2giLCIkd2F0Y2giLCJpc0RlZmluZWQiLCJyZWplY3QiLCJwcm9taXNlIl0sIm1hcHBpbmdzIjoiQ0FBQSxXQUNBQSxRQUFBQyxPQUFBLGlCQ0RB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QUFrRCxRQUFBLFdBQUEsYUFBQSxTQUFBcEMsWUFDQSxHQUFBdUIsTUFBQVQsSUFDQUEsTUFBQVcsUUFFQVgsS0FBQXFCLEtBQUEsV0FDQSxNQUFBRSxRQUFBQyxLQUFBZixLQUFBRSxNQUFBYyxPQUFBLEdBR0F6QixLQUFBbkIsZUFBQSxTQUFBOEIsTUFDQXpCLFdBQUF3QyxZQUFBZixNQUdBWCxLQUFBckIsT0FBQSxTQUFBZ0MsTUFDQXpCLFdBQUF3QyxZQUFBZixLQUNBRixLQUFBRSxLQUFBQSxNQUVBWCxLQUFBMkIsUUFBQSxXQUNBekMsV0FBQXdDLFlBQUEsS0FDQWpCLEtBQUFFLEtBQUEsU0FJQXhDLFFBQUFDLE9BQUEsUUFBQTZDLFFBQUEsZ0JBQUEsS0FBQSxhQUFBLFNBQUEsU0FBQVcsR0FBQTFDLFdBQUFvQixRQUNBLEdBQUFkLGNBQUEsQ0FFQSxRQUNBSSxRQUFBLFdBQ0FILFFBQUFDLElBQUEsZ0JBQ0EsSUFBQW1DLFVBQUFELEdBQUFFLFFBQ0FDLFFBQUE3QyxXQUFBOEMsT0FBQSxjQUFBLFNBQUFOLGFBQ0F2RCxRQUFBOEQsVUFBQVAsZUFDQUEsWUFDQUcsU0FBQWpDLFFBQUE4QixhQUVBRyxTQUFBSyxTQUVBMUMsYUFBQSxFQUNBdUMsWUFHQSxPQUFBRixVQUFBTSxTQUdBM0MsWUFBQSxXQUNBLE1BQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuXHR2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2dlbmVyYWwnLCBbXSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XHJcblx0dmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd1c2VyJywgW10pXHJcblx0LnJ1bihmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbil7XHJcblx0XHQkaHR0cC5nZXQoJy9hcGkvcHJvZmlsZScpXHJcblx0XHQuc3VjY2VzcyhmdW5jdGlvbihyZXMpe1xyXG5cdFx0XHRTZXNzaW9uLmNyZWF0ZShyZXMpO1xyXG5cdFx0fSlcclxuXHRcdC5lcnJvcihmdW5jdGlvbihyZXMpe1xyXG5cdFx0XHRTZXNzaW9uLnNldEN1cnJlbnRVc2VyKHt9KTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpe1xyXG5cdHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZ3JhZGVyJywgXHJcblx0XHRbXHJcblx0XHRcdCd1aS5yb3V0ZXInLFxyXG5cdFx0XHQnZ2VuZXJhbCcsXHJcblx0XHRcdCd1c2VyJ1xyXG5cdFx0XSk7XHJcblxyXG5cdC8vcmVtb3ZlIHRoZSBoYXNoXHJcblx0YXBwLmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgZnVuY3Rpb24oJGxvY2F0aW9uUHJvdmlkZXIpe1xyXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG5cdH1dKTtcclxuXHRcclxuXHRhcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQXV0aFJlc29sdmVyKSB7XHJcbiAgXHRcdCRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgbmV4dCkge1xyXG4gIFx0XHRcdGlmIChBdXRoUmVzb2x2ZXIuYklzUmVzb2x2ZWQoKSl7XHJcbiAgXHRcdFx0XHRjb25zb2xlLmxvZygnc3RhdGVDaGFuZ2VTdGFydCByZXNvbHZlZCcpO1xyXG4gIFx0XHRcdFx0Y29uc29sZS5sb2coJ2F1dGg6ICcgKyBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSk7XHJcbiAgXHRcdFx0fWVsc2V7XHJcbiAgXHRcdFx0XHRBdXRoUmVzb2x2ZXIucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdzdGF0ZUNoYW5nZVN0YXJ0IG5vdCByZXNvbHZlZCcpO1xyXG4gIFx0XHRcdFx0XHRjb25zb2xlLmxvZygnYXV0aDogJyArIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKTtcclxuICBcdFx0XHRcdH0pXHJcbiAgXHRcdFx0fVxyXG4gIFx0XHR9KTtcclxuXHR9KVxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKXtcclxuXHRhbmd1bGFyLm1vZHVsZSgnZ2VuZXJhbCcpLmNvbnRyb2xsZXIoJ05hdkNvbnRyb2xsZXInLCBmdW5jdGlvbigkaHR0cCwgQXV0aFNlcnZpY2Upe1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzO1xyXG5cdFx0dGhpcy5iTG9nZ2VkSW4gPSBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHR9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKXtcclxuXHRhbmd1bGFyLm1vZHVsZSgnZ2VuZXJhbCcpLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xyXG5cdFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2luZGV4Jywge1xyXG5cdFx0XHR1cmw6ICcvJyxcclxuXHRcdFx0cmVzb2x2ZToge1xyXG5cdFx0XHRcdGF1dGg6IGZ1bmN0aW9uIHJlc29sdmVBdXRoZW50aWNhdGlvbihBdXRoUmVzb2x2ZXIpIHsgXHJcblx0XHRcdFx0XHRyZXR1cm4gKEF1dGhSZXNvbHZlci5iSXNSZXNvbHZlZCgpID09PSB0cnVlIHx8IEF1dGhSZXNvbHZlci5yZXNvbHZlKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbGxlcjogZnVuY3Rpb24oJHN0YXRlLCBBdXRoU2VydmljZSl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2NvbnRyb2xsZXIgY2FsbGVkJyk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ0NvbnRyb2xsZXIgYXV0aDogJyArIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKVxyXG5cdFx0XHRcdGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSl7XHJcblx0XHRcdFx0XHQkc3RhdGUuZ28oJ2Rhc2hib2FyZCcpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0JHN0YXRlLmdvKCdwdWJsaWMnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwdWJsaWMnLCB7XHJcblx0XHRcdHVybDogJy8nLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJy9hbmd1bGFyL2dlbmVyYWwvcGFydGlhbHMvaW5kZXguZ2VuZXJhbC5odG1sJ1xyXG5cdFx0fSk7XHJcblx0fV0pO1xyXG59KSgpOyIsIihmdW5jdGlvbigpe1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgndXNlcicpLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzdGF0ZSwgJHJvb3RTY29wZSwgQXV0aFNlcnZpY2Upe1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzO1xyXG5cdFx0dGhpcy5hdXRoTWVzc2FnZSA9ICcnO1xyXG5cdFx0dGhpcy51c2VyID0ge1xyXG5cdFx0XHR1c2VybmFtZTogJycsXHJcblx0XHRcdHBhc3N3b3JkOiAnJ1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmxvZ2luID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdEF1dGhTZXJ2aWNlLmxvZ2luKHJvb3QudXNlcikudGhlbihcclxuXHRcdFx0XHRmdW5jdGlvbihyZXMpe1xyXG5cdFx0XHRcdFx0JHN0YXRlLmdvKCdwcm9maWxlJyk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRmdW5jdGlvbihyZXMpe1xyXG5cdFx0XHRcdFx0cm9vdC5hdXRoTWVzc2FnZSA9IHJlcy5kYXRhLnVzZXJNZXNzYWdlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR9KTtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgndXNlcicpLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZENvbnRyb2xsZXInLCBmdW5jdGlvbigkc3RhdGUsIFNlc3Npb24pe1xyXG5cdFx0dGhpcy51c2VyID0gU2Vzc2lvbi51c2VyO1xyXG5cdH0pO1xyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgndXNlcicpLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDb250cm9sbGVyJywgZnVuY3Rpb24oJHN0YXRlLCBTZXNzaW9uKXtcclxuXHRcdHRoaXMudXNlciA9IFNlc3Npb24udXNlcjtcclxuXHR9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24oKXtcclxuXHRhbmd1bGFyLm1vZHVsZSgndXNlcicpLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xyXG5cdFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xyXG5cdFx0XHR1cmw6ICcvbG9naW4nLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJy9hbmd1bGFyL3VzZXIvcGFydGlhbHMvYXV0aC51c2VyLmh0bWwnLFxyXG5cdFx0XHRjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9naW5DdHJsJ1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcclxuXHRcdFx0dXJsOiAnJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICcvYW5ndWxhci91c2VyL3BhcnRpYWxzL2Rhc2hib2FyZC5odG1sJyxcclxuXHRcdFx0Y29udHJvbGxlcjogJ0Rhc2hib2FyZENvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6ICdkYXNoYm9hcmRDdHJsJ1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2ZpbGUnLCB7XHJcblx0XHRcdHVybDogJy9wcm9maWxlJyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICcvYW5ndWxhci91c2VyL3BhcnRpYWxzL3Byb2ZpbGUudXNlci5odG1sJyxcclxuXHRcdFx0Y29udHJvbGxlcjogJ1Byb2ZpbGVDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOiAncHJvZmlsZUN0cmwnXHJcblx0XHR9KTtcclxuXHR9XSk7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XHJcblx0YW5ndWxhci5tb2R1bGUoJ3VzZXInKS5mYWN0b3J5KCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbikge1xyXG5cdFx0dmFyIGF1dGhTZXJ2aWNlID0ge307XHJcblxyXG5cdFx0YXV0aFNlcnZpY2UubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcclxuXHRcdFx0cmV0dXJuICRodHRwXHJcblx0XHRcdC5wb3N0KCcvYXV0aC9sb2NhbCcsIGNyZWRlbnRpYWxzKVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcblx0XHRcdFx0U2Vzc2lvbi5jcmVhdGUocmVzLmRhdGEpO1xyXG5cdFx0XHRcdHJldHVybiByZXMuZGF0YTtcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIFNlc3Npb24ubGl2ZSgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gYXV0aFNlcnZpY2U7XHJcblx0fSk7XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCd1c2VyJykuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblx0XHR2YXIgcm9vdCA9IHRoaXM7XHJcblx0XHR0aGlzLnVzZXIgPSB7fTtcclxuXHJcblx0XHR0aGlzLmxpdmUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRyZXR1cm4gKE9iamVjdC5rZXlzKHJvb3QudXNlcikubGVuZ3RoID4gMCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zZXRDdXJyZW50VXNlciA9IGZ1bmN0aW9uKHVzZXIpe1xyXG5cdFx0XHQkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gdXNlcjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHVzZXIpe1xyXG5cdFx0XHQkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gdXNlcjtcclxuXHRcdFx0cm9vdC51c2VyID0gdXNlcjtcclxuXHRcdH07XHJcblx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCRyb290U2NvcGUuY3VycmVudFVzZXIgPSBudWxsO1xyXG5cdFx0XHRyb290LnVzZXIgPSBudWxsO1xyXG5cdFx0fTtcclxuXHR9KTtcclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ3VzZXInKS5mYWN0b3J5KCdBdXRoUmVzb2x2ZXInLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJHN0YXRlKSB7XHJcblx0XHR2YXIgYklzUmVzb2x2ZWQgPSBmYWxzZTtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ3Jlc29sdmUgYXNrZWQnKTtcclxuXHRcdFx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cdFx0XHRcdHZhciB1bndhdGNoID0gJHJvb3RTY29wZS4kd2F0Y2goJ2N1cnJlbnRVc2VyJywgZnVuY3Rpb24gKGN1cnJlbnRVc2VyKSB7XHJcblx0XHRcdFx0XHRpZiAoYW5ndWxhci5pc0RlZmluZWQoY3VycmVudFVzZXIpKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50VXNlcikge1xyXG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoY3VycmVudFVzZXIpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdCgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJJc1Jlc29sdmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0dW53YXRjaCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0YklzUmVzb2x2ZWQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIGJJc1Jlc29sdmVkO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH0pO1xyXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
