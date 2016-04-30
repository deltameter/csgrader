(function(){
	var app = angular.module('misc', []);

	app.filter('trustAsHTML', function($sce) { return $sce.trustAsHtml; });
})();