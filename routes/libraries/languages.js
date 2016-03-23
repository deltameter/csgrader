var languages = [
    {
        langID: 0,
        language: 'Java',
        defaultCode: { Main: 'import org.junit.*;\n\npublic class Main{\n\tpublic static void main(String[] args){\n\t\t\n\t}\n}' }
    }
]

var findByString = function(langString){
	var language = languages.find(function(lang){
		return lang.language.toLowerCase() === langString.toLowerCase();
	});

	return language;
}

module.exports = {
	languages: languages,
	findByString: findByString
}