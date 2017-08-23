/*eslint quotes: ["error", "single"]*/
// Related to: https://github.com/Microsoft/TypeScript/issues/13270
'use strict';

const gulp = require('gulp');
const sourceMaps = require('gulp-sourcemaps');
const tsc = require('gulp-typescript');
const gulpConfig = require('./../gulp-config');

gulp.task('transpile', ['clean'], function() {
    const tsProject = tsc.createProject(gulpConfig.typescriptCompilerOptions);
    const tsResult = gulp.src(gulpConfig.allTypescript, { base: '.' })
        .pipe(sourceMaps.init())
        .pipe(tsProject())
        .on('error', function(err) {
            throw new Error('TypeScript transpilation error: ' + err);
        });

    return tsResult.js
        .pipe(sourceMaps.write('.', { includeContent: false, sourceRoot: './' }))
        .pipe(gulp.dest(''));
});