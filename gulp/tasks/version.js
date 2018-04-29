'use strict';

const bump = require('gulp-bump');
const gulp = require('gulp');
const gulpConfig = require('./../gulp-config');
const vstsBump = require('gulp-vsts-bump');

gulp.task('bump-vsts-task-extension-version', function () {
    return gulp.src(gulpConfig.vstsExtensionManifest)
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('bump-task-version', function () {
    return gulp.src(gulpConfig.taskManifestFile)
        .pipe(vstsBump())
        .pipe(gulp.dest('./'));
});

gulp.task('bump-package-version', function () {
    return gulp.src(gulpConfig.packageJSON)
        .pipe(bump())
        .pipe(gulp.dest('./'));
});