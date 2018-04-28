'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpTslint = require('gulp-tslint');
const tslint = require('tslint');
const gulpConfig = require('./../gulp-config');

gulp.task('eslint', ['transpile'], function () {
    return gulp.src(gulpConfig.allJavascript)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('tslint', function () {
    const program = tslint.Linter.createProgram(gulpConfig.typescriptCompilerOptions);
    program.formatter = 'verbose';
    program.rulesDirectory = 'node_modules/tslint-microsoft-contrib';

    return gulp.src(gulpConfig.allTypescript)
        .pipe(gulpTslint({ program }))
        .pipe(gulpTslint.report());
});