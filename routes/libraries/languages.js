const testFileName = 'Main';
var languages = [
    {
        //this is saved to the exercise document. 
        definition: {
        	langID: 0,
        	language: 'Java',
        	fileExt: '.java'
        },

        defaultCode: { Main: '//write your unit testing code here\nimport org.junit.*;\n\npublic class Main{\n\tpublic static void main(String[] args){\n\t\t\n\t}\n}' }
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