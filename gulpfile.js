var gulp = require('gulp'),
	concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	streamqueue = require('streamqueue'),
	ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
	streamqueue({ objectMode: true },
		gulp.src('./public/angular/**/*.module.js'),
		//include everything but the module js
		gulp.src(['!./public/angular/**/main.js', '!./public/angular/**/*.module.js', 
			'./public/angular/**/core.js', './public/angular/**/*.js'])
		)
	//.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
	//.pipe(sourcemaps.write())
	.pipe(gulp.dest('public/angular/'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch('public/angular/**/*.js', ['js'])
});