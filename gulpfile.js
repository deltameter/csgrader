var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	streamqueue = require('streamqueue'),
	ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
	streamqueue({ objectMode: true },
		//Load Ace
		gulp.src('./bower_components/ace-builds/src-min-noconflict/ace.js'),
		//Load ui-ace
		gulp.src('./bower_components/angular-ui-ace/ui-ace.min.js'),

		gulp.src('./public/angular/**/*.module.js'),
		//include everything but the module js
		gulp.src(['!./public/angular/**/main.min.js', '!./public/angular/**/*.module.js', 
			'./public/angular/**/core.js', './public/angular/**/*.js'])
		)
	
	.pipe(sourcemaps.init())
	.pipe(concat('main.min.js'))
	.pipe(ngAnnotate())
	.pipe(uglify({ mangle: false }))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./public/angular/'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch(gulp.src['!./public/angular/main.min.js', './public/angular/**/*.js'], ['js'])
});