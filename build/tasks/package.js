/*eslint quotes: ["error", "single"]*/
// Related to: https://github.com/Microsoft/TypeScript/issues/13270
'use strict';

var gulp = require('gulp');
var gulpConfig = require('./../gulp-config');

gulp.task('copy-dependencies', ['clean-output'], function() {
    return gulp.src('./node_modules/**/*')
        .pipe(gulp.dest(gulpConfig.vstsPublishRoot + '/node_modules/'));
});

gulp.task('package-vsts-task', ['transpile', 'clean-output'], function () {
    return gulp.src(gulpConfig.vstsTaskContent)
        .pipe(gulp.dest(gulpConfig.vstsPublishRoot));
});