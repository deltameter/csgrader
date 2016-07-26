var gulp = require('gulp'),
	fs = require('fs'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	streamqueue = require('streamqueue'),
	ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
	streamqueue({ objectMode: true },
		//DEPENDENCIES
		gulp.src('./public/js/vendor/oclazyload/dist/ocLazyLoad.min.js'),

		//load modal service
		gulp.src('./public/js/vendor/angular-modal-service/dst/angular-modal-service.min.js'),

		//our code
		gulp.src('./angular/**/*.module.js'),
		//include everything but the module js
		gulp.src(['!./angular/**/*.module.js', './angular/**/core.js', './angular/**/*.js'])
		)
	
	//.pipe(sourcemaps.init())
	.pipe(concat('main.min.js'))
	.pipe(ngAnnotate())
	.pipe(uglify({ mangle: false }))
	//.pipe(sourcemaps.write())
	.pipe(gulp.dest('./public/js'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch(['./angular/**/*.js'], ['js'])
});