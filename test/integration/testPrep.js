global.__base = __dirname + '/../../';
const models_path = __base + 'models/';

require(models_path + 'question');
require(models_path + 'exercise');
require(models_path + 'submission');
require(models_path + 'assignment');
require(models_path + 'student');
require(models_path + 'classroom');
require(models_path + 'course');
require(models_path + 'user');
