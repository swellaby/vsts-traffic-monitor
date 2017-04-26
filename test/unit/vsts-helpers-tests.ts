'use strict';

import Chai = require('chai');
import vstsHelpers = require('./../../src/vsts-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in ./src/vsts-helpers.ts
 */
suite('VSTS Helpers Suite:', () => {
    const invalidAccountNameErrorMessage = 'Invalid account name.';
    const graphApiUrlSegment = '.vssps.visualstudio.com/_apis/graph/';
    const graphApiUrlPrefix = 'https://';
    const accountName = 'swellaby';
    const expectedGraphApiUrl = graphApiUrlPrefix + accountName + graphApiUrlSegment;

    suite('convertPatToApiHeader Tests:', () => {
        const invalidParamErrorMessage = 'Invalid access token.';

        test('Should throw an error when access token is null', () => {
            assert.throws(() => vstsHelpers.convertPatToApiHeader(null), invalidParamErrorMessage);
        });

        test('Should throw an error when access token is undefined', () => {
            assert.throws(() => vstsHelpers.convertPatToApiHeader(undefined), invalidParamErrorMessage);
        });

        test('Should return correct base64 string when access token is valid', () => {
            const expectedBase64 = 'OkhlbGxvIFdvcmxk';
            const actualBase64 = vstsHelpers.convertPatToApiHeader('Hello World');
            assert.deepEqual(actualBase64, expectedBase64);
        });
    });

    // eslint-disable-next-line max-statements
    suite('validateAccountName Tests:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.validateAccountName(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.validateAccountName(undefined), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name does not begin with a letter or number', () => {
            assert.throws(() => vstsHelpers.validateAccountName('&invalid'), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name does not end with a letter or number', () => {
            assert.throws(() => vstsHelpers.validateAccountName('invalid**'), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name begins with a hyphen', () => {
            assert.throws(() => vstsHelpers.validateAccountName('-adfasdf'), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name ends with a hyphen', () => {
            assert.throws(() => vstsHelpers.validateAccountName('a897556-'), invalidAccountNameErrorMessage);
        });

        test('Should not throw an error when account name contains a hyphen', () => {
            assert.doesNotThrow(() => vstsHelpers.validateAccountName('caleb-account'), invalidAccountNameErrorMessage);
        });

        test('Should not throw an error when account name contains only alphanumeric characters', () => {
            assert.doesNotThrow(() => vstsHelpers.validateAccountName('helloWorl129836d'), invalidAccountNameErrorMessage);
        });

        test('Should not throw an error when account name contains only alphabetic characters', () => {
            assert.doesNotThrow(() => vstsHelpers.validateAccountName('abcdefghij'), invalidAccountNameErrorMessage);
        });

        test('Should not throw an error when account name contains only numeric characters', () => {
            assert.doesNotThrow(() => vstsHelpers.validateAccountName('123456789'), invalidAccountNameErrorMessage);
        });

        test('Should not throw an error when account name contains upper case alphabetic characters', () => {
            assert.doesNotThrow(() => vstsHelpers.validateAccountName('1Aa2Bb3Cc456789'), invalidAccountNameErrorMessage);
        });
    });

    suite('buildGraphApiUrl Tests:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid', () => {
            const expectedUrl = 'https://' + accountName + graphApiUrlSegment;
            const actualUrl = vstsHelpers.buildGraphApiUrl(accountName);
            assert.deepEqual(expectedUrl, actualUrl);
        });

        test('Should have correct value for exported Graph API Url segment', () => {
            assert.deepEqual(vstsHelpers.graphApiUrlSegment, graphApiUrlSegment);
        });
    });

    suite('buildGraphApiUsersUrl Tests:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUsersUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUsersUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid', () => {
            const actualUrl = vstsHelpers.buildGraphApiUsersUrl(accountName);
            const expectedUrl = expectedGraphApiUrl + 'users';
            assert.deepEqual(expectedUrl, actualUrl);
        });
    });
});