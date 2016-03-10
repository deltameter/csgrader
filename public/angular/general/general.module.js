(function(){
	var app = angular.module('general', [])

	.config(['$provide', function($provide){
        // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['$delegate', function(taOptions){
            taOptions.toolbar = [
            	['h1','h2','h3', 'p'],
            	['bold','italics','underline'], 
            	['ul', 'ol'], 
            	['justifyLeft', 'justifyCenter','justifyRight'], 
            	['insertImage', 'insertLink','insertVideo'], 
            	['html']
            ];
            return taOptions; // whatever you return will be the taOptions
        }]);
    }]);
})();