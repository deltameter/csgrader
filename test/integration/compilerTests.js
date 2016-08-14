require('./testPrep.js');

var mongoose = require('mongoose'),
	languageHelper = require(__base + 'routes/libraries/languages'),
	expect = require('chai').expect,
	Exercise = mongoose.model('Exercise')

describe('Compilation', function(){
	it('should create, compile, and execute a java exercise', function(done){
		this.timeout(5000);
		var exercise = Exercise.create(languageHelper.findByLangName('Java'), 'My Exercise');

		var edit = {
			title: 'Dank Exercise',
			triesAllowed: 'unlimited',
			context: 'Create a class called Kang that prints out with a public void speak that returns "WE WUZ KANGZ"',
			code: [
				{ 
					name: 'Kang.java',
					code: 'public class Kang { }'
				}
			],
			tests: [
				{
					name: 'SpeakTest.java',
					pointsWorth: 5,
					description: 'kang.speak() returns correct value',
					code: 'import org.junit.*; public class SpeakTest{ public static void main(String[] args){ Kang kang = new Kang();' + 
					'Assert.assertEquals("WE WUZ KANGZ", kang.speak()); }}'
				},
				{
					name: 'HistoryTest.java',
					pointsWorth: 5,
					description: 'kang.getHistory() returns correct value',
					code: 'import org.junit.*; public class HistoryTest{ public static void main(String[] args){ Kang kang = new Kang();' + 
					'Assert.assertEquals("WE WUZ EGYPTIANS AND SHIET", kang.getHistory()); }}'
				}
			]
		}

		exercise.edit(edit);

		const code = [
			{ 
				name: 'Kang.java',
				code: 'public class Kang{ public String speak(){ return "WE WUZ KANGZ"; } public String getHistory(){ return "WE WUZ EGYPTIANS AND SHIET"; } }'
			}
		]

		exercise.runTests(code, function(err, results){
			expect(results.bIsCorrect).to.equal(true);
			done()
		})
	})

	it('should create and interpret a python exercise', function(done){
		this.timeout(5000);
		var exercise = Exercise.create(languageHelper.findByLangName('python2.7'), 'My Exercise');

		var edit = {
			title: 'Dank Exercise',
			triesAllowed: 'unlimited',
			context: 'Create a class called Kang that prints out with a public void speak that returns "WE WUZ KANGZ"',
			code: [
				{ 
					name: 'Kang.java',
					code: 'public class Kang { }'
				}
			],
			tests: [
				{
					name: 'HelloTest.py',
					pointsWorth: 5,
					description: 'HelloWorld.speak() returns correct value',
					code: 'import unittest\nimport HelloWorld\nclass HelloTest(unittest.TestCase):\n  def test(self):\n    self.assertEqual(\'Hello World!\', HelloWorld.speak())\nif __name__ == "__main__":\n  unittest.main()'
				},
			]
		}

		exercise.edit(edit);

		const code = [
			{ 
				name: 'HelloWorld.py',
				code: 'def speak():\n  return "Hello World!"'
			}
		]

		exercise.runTests(code, function(err, results){
			expect(results.bIsCorrect).to.equal(true);
			done()
		})
	})
});
	