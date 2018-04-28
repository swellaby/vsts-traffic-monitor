'use strict';

const path = require('path');
const srcRoot = './src';
const testRoot = './test';
const tsconfig = 'tsconfig.json';
const excludedExpressServerFile = '!' + srcRoot + '/server.js';
const excludedInterfaceFiles = '!' + srcRoot + '/interfaces/**/*.js';
const appTranspiledJavaScript = srcRoot + '/**/*.js';
const vstsPublishRoot = './.vsts-publish';
const vstsPublishTaskRoot = vstsPublishRoot + '/task';
const vstsPublishImageRoot = vstsPublishRoot + '/images';
const vssExtensionManifest = './vss-extension.json';

module.exports = {
    packageJSON: path.resolve('package.json'),
    root: srcRoot,
    vstsPublishRoot: vstsPublishRoot,
    vstsPublishTaskRoot: vstsPublishTaskRoot,
    vstsPublishTaskSrc: vstsPublishTaskRoot + '/src',
    vstsTaskContent: [
        './task.json',
        './package.json',
        'docs/images/icons/icon.png',
        './task-wrapper.js'
    ],
    vstsExtensionContent: [
        vssExtensionManifest,
        './README.md',
        './LICENSE',
        'docs/VSTS-TASK.md'
    ],
    vstsExtensionManifest: vssExtensionManifest,
    vstsExtensionImages: [
        'docs/images/**/*',
    ],
    vstsPublishImageRoot: vstsPublishImageRoot,
    allJavascript: [
        './**/*.js',
        '!node_modules/**',
    ],
    allTranspiledJavascript: [
        srcRoot + '/**/*.js*',
        testRoot + '/**/*.js*',
    ],
    appTranspiledJavaScript: [
        appTranspiledJavaScript,
    ],
    istanbulCoverageJavaScript: [
        srcRoot + '/**/*.js',
        excludedInterfaceFiles,
        excludedExpressServerFile
    ],
    javascriptUnitTests: testRoot + '/unit/**/*.js',
    javascriptComponentIntegrationTests: testRoot + '/component-integration/**/*.js',
    allTypescript: [
        srcRoot + '/**/*.ts',
        testRoot + '/**/*.ts',
    ],
    appTypescript: [
        srcRoot + '/**/*.ts',
    ],
    typescriptCompilerOptions: path.resolve(tsconfig),
    taskManifestFile: path.resolve('./task.json')
};