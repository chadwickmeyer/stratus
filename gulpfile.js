var gulp = require('gulp');
var notify = require('gulp-notify');
var growl = require('gulp-notify-growl');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

gulp.task('jscs', function () {
      gulp.src(['stratus.js', '*/*.js', '*/*/*.js'])
        .pipe(jscs())
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Passed!'
          }));
    });

gulp.task('lint', function () {
      gulp.src(['stratus.js', '*/*.js', '*/*/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({
            title: 'JSHint',
            message: 'JSHint Passed!'
          }));
    });
