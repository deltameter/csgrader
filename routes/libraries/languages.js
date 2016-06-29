const testFileName = 'Main';
var languages = [
    {
        //this is saved to the exercise document. 
        definition: {
        	langID: 0,
        	language: 'Java',
        	fileExt: '.java'
        }
    }
]

var findByString = function(langString){
	var language = languages.find(function(lang){
		return lang.definition.language.toLowerCase() === langString.toLowerCase();
	});

	return language;
}

module.exports = {
    testFileName: testFileName,
	languages: languages,
	findByString: findByString
}