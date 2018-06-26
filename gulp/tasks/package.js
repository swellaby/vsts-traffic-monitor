'use strict';

const copyNodeModules = require('copy-node-modules');
const gulp = require('gulp');
const gulpConfig = require('./../gulp-config');

gulp.task('copy-dependencies', function (done) {
    // eslint-disable-next-line no-unused-vars
    copyNodeModules('./', gulpConfig.vstsPublishTaskRoot, { devDependencies: false }, function(err, result) {
        if (err) {
            console.error(err);
            process.exit(1);
            done();
        }
        done();
    });
});

gulp.task('package-vsts-task-src', [ 'copy-dependencies' ], function () {
    return gulp.src(gulpConfig.appTranspiledJavaScript)
        .pipe(gulp.dest(gulpConfig.vstsPublishTaskSrc));
});

gulp.task('package-vsts-task-files', [ 'copy-dependencies', 'bump-task-version', 'bump-package-version' ], function () {
    return gulp.src(gulpConfig.vstsTaskContent)
        .pipe(gulp.dest(gulpConfig.vstsPublishTaskRoot));
});

gulp.task('package-vsts-extension-images', [ 'copy-dependencies' ], function () {
    return gulp.src(gulpConfig.vstsExtensionImages)
        .pipe(gulp.dest(gulpConfig.vstsPublishImageRoot));
});

gulp.task('package-vsts-task-extension-files',
    ['package-vsts-task-files', 'package-vsts-task-src', 'bump-vsts-task-extension-version', 'package-vsts-extension-images'],
    function () {
        return gulp.src(gulpConfig.vstsExtensionContent)
            .pipe(gulp.dest(gulpConfig.vstsPublishRoot));
    }
);
