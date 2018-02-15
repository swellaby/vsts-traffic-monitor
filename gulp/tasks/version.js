/*eslint quotes: ["error", "single"]*/
// Related to: https://github.com/Microsoft/TypeScript/issues/13270
'use strict';

const bump = require('gulp-bump');
const fs = require('fs');
const gulp = require('gulp');
const gulpConfig = require('./../gulp-config');
const jsonModify = require('gulp-json-modify');

gulp.task('bump-vsts-task-extension-version', function () {
    return gulp.src(gulpConfig.vstsExtensionManifest)
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('bump-task-version', function () {
    const taskManifest = JSON.parse(fs.readFileSync(gulpConfig.taskManifestFile));
    const bumpedPatch = (parseInt(taskManifest.version.Patch) + 1).toString();

    return gulp.src(gulpConfig.taskManifestFile)
        .pipe(jsonModify({ 
            key: 'version.Patch',
            value: bumpedPatch
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-package-version', function () {
    return gulp.src(gulpConfig.packageJSON)
        .pipe(bump())
        .pipe(gulp.dest('./'));
});