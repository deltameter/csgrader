var gulp = require('gulp'),
	concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
	gulp.src(['public/javascripts/**/core.js', 'public/javascripts/**/*.js'])
	//.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
	//.pipe(sourcemaps.write())
	.pipe(gulp.dest('public/javascripts/'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch('public/javascripts/**/*.js', ['js'])
});