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

var findByLangName = function(langString){
	var language = languages.find(function(lang){
		return lang.definition.language.toLowerCase() === langString.toLowerCase();
	});

	return language;
}

var findByLangID = function(langID){
    var language = languages.find(function(lang){
        return lang.definition.langID === langID;
    });

    return language;
}

module.exports = {
	languages: languages,
	findByLangName: findByLangName,
    findByLangID: findByLangID
}