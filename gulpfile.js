var gulp = require('gulp'),
	concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	streamqueue = require('streamqueue'),
	ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {

	streamqueue({ objectMode: true },
		gulp.src('./public/javascripts/**/*.module.js'),
		//include everything but the module js
		gulp.src(['!./public/javascripts/**/*.module.js', './public/javascripts/**/core.js', './public/javascripts/**/*.js'])
		)
	//.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
	//.pipe(sourcemaps.write())
	.pipe(gulp.dest('public/'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch('public/javascripts/**/*.js', ['js'])
});