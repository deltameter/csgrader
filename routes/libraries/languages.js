var languages = [
    {
        //this is saved to the exercise document. 
        definition: {
        	langID: 0,
        	language: 'Java',
        	fileExt: '.java'
        }
    },
    {
        definition: {
            langID: 1,
            language: 'Python2',
            fileExt: '.py'
        }
    },
    {
        definition: {
            langID: 1,
            language: 'Python3',
            fileExt: '.py'
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