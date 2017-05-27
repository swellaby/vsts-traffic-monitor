/*eslint quotes: ["error", "single"]*/
// Related to: https://github.com/Microsoft/TypeScript/issues/13270
'use strict';

var path = require('path');
var srcRoot = './src';
var vstsPublishRoot = './vsts-publish';
var testRoot = './test';
var tsconfig = './tsconfig.json';
var notServer = '!' + srcRoot + '/server.js';
var notTask = '!' + srcRoot + '/task.js';
var notInterfaces = '!' + srcRoot + '/interfaces/**/*.js';

module.exports = {
    packageJSON: path.resolve('package.json'),
    root: srcRoot,
    vstsPublishRoot: vstsPublishRoot,
    vstsTaskContent: [
        appTranspiledJavaScript,
        './task.json',
        './package.json',
        './icon.png'
    ],
    allJavascript: [
        './**/*.js',
        '!node_modules/**',
    ],
    allTranspiledJavascript: [
        srcRoot + '/**/*.js*',
        testRoot + '/**/*.js*',
    ],
    appTranspiledJavaScript: [
        srcRoot + '/**/*.js',          
    ],
    istanbulCoverageJavaScript: [
        srcRoot + '/**/*.js',
        notInterfaces,
        notServer,
        notTask,
    ],
    javascriptUnitTests: testRoot + '/unit/**/*.js',
    javascriptComponentIntegrationTests: testRoot + '/component-integration/**/*.js',
    allTypescript: [
        srcRoot + '/**/*.ts',
        testRoot + '/**/*.ts',
        '/node_modules/vsts-task-lib/**.d.ts'
    ],
    appTypescript: [
        srcRoot + '/**/*.ts',
    ],
    typescriptCompilerOptions: tsconfig
};
