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
		//Load Ace
		gulp.src('./bower_components/ace-builds/src-min-noconflict/ace.js'),
		//Load ui-ace
		gulp.src('./bower_components/angular-ui-ace/ui-ace.min.js'),

		//load ui-tinymc

		gulp.src('./bower_components/angular-ui-tinymce/dist/tinymce.min.js'),
		
		//load the datepicker
		gulp.src('./bower_components/moment/moment.js'),
		gulp.src('./bower_components/angular-datepicker/dist/angular-datepicker.min.js'),
		//load modal service
		gulp.src('./bower_components/angular-modal-service/dst/angular-modal-service.min.js'),

		//our code
		gulp.src('./public/angular/**/*.module.js'),
		//include everything but the module js
		gulp.src(['!./public/angular/**/main.min.js', '!./public/angular/**/*.module.js', 
			'./public/angular/**/core.js', './public/angular/**/*.js'])
		)
	
	//.pipe(sourcemaps.init())
	.pipe(concat('main.min.js'))
	.pipe(ngAnnotate())
	.pipe(uglify({ mangle: false }))
	//.pipe(sourcemaps.write())
	.pipe(gulp.dest('./public/'))
});

gulp.task('watch', ['js'], function () {
	gulp.watch(['!./public/angular/main.min.js', './public/angular/**/*.js'], ['js'])
});