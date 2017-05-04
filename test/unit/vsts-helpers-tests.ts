'use strict';

import Chai = require('chai');
import vstsHelpers = require('./../../src/vsts-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/vsts-helpers.ts}
 */
suite('VSTS Helpers Suite:', () => {
    const invalidAccountNameErrorMessage = 'Invalid account name.';
    const invalidAccessTokenErrorMessage = 'Invalid access token.';
    const protocol = 'https://';
    const accountName = 'swellaby';
    const graphApiUrlSegment = '.vssps.visualstudio.com/_apis/graph/';
    const expectedGraphApiUrl = protocol + accountName + graphApiUrlSegment;
    const utilizationApiUrlSgement = '.visualstudio.com/_apis/utilization/';
    const expectedUtilizationApiUrl = protocol + accountName + utilizationApiUrlSgement;
    const accessToken = 'Hello World';
    const expectedBase64AccessToken = 'OkhlbGxvIFdvcmxk';

    suite('convertPatToApiHeader Suite:', () => {
        test('Should throw an error when access token is null', () => {
            assert.throws(() => vstsHelpers.convertPatToApiHeader(null), invalidAccessTokenErrorMessage);
        });

        test('Should throw an error when access token is undefined', () => {
            assert.throws(() => vstsHelpers.convertPatToApiHeader(undefined), invalidAccessTokenErrorMessage);
        });

        test('Should return correct base64 string when access token is valid', () => {
            const actualBase64 = vstsHelpers.convertPatToApiHeader(accessToken);
            assert.deepEqual(actualBase64, expectedBase64AccessToken);
        });
    });

    // eslint-disable-next-line max-statements
    suite('validateAccountName Suite:', () => {
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

    suite('buildGraphApiUrl Suite:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid', () => {
            const expectedUrl = protocol + accountName + graphApiUrlSegment;
            const actualUrl = vstsHelpers.buildGraphApiUrl(accountName);
            assert.deepEqual(expectedUrl, actualUrl);
        });

        test('Should have correct value for exported Graph API Url segment', () => {
            assert.deepEqual(vstsHelpers.vstsGraphApiUrlSegment, graphApiUrlSegment);
        });
    });

    suite('buildGraphApiUsersUrl Suite:', () => {
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

    suite('buildUtilizationApiUrl Suite:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationApiUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationApiUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid', () => {
            const expectedUrl = protocol + accountName + utilizationApiUrlSgement;
            const actualUrl = vstsHelpers.buildUtilizationApiUrl(accountName);
            assert.deepEqual(expectedUrl, actualUrl);
        });

        test('Should have correct value for exported Graph API Url segment', () => {
            assert.deepEqual(vstsHelpers.vstsUtilizationApiUrlSegment, utilizationApiUrlSgement);
        });
    });

    suite('buildUtilizationUsageSummaryApiUrl Suite:', () => {
        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid', () => {
            const actualUrl = vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName);
            const expectedUrl = expectedUtilizationApiUrl + 'usagesummary';
            assert.deepEqual(expectedUrl, actualUrl);
        });
    });

    // eslint-disable-next-line max-statements
    suite('buildRestApiBasicAuthRequestOptions Suite:', () => {
        const url = expectedUtilizationApiUrl + 'notimportant';
        const expectedAuthValue = 'basic ' + expectedBase64AccessToken;

        test('Should throw an error when account name is null and access token is null', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(null, null), invalidAccessTokenErrorMessage);
        });

        test('Should throw an error when account name is null and access token is undefined', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(null, undefined), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when account name is null and access token is an empty string', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(null, ''), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when account name is null and access token is valid', () => {
            const options = vstsHelpers.buildRestApiBasicAuthRequestOptions(null, accessToken);
            assert.deepEqual(options.url, null);
            assert.deepEqual(options.headers.Authorization, expectedAuthValue);
        });

        test('Should throw an error when url is undefined and access token is null', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(undefined, null), invalidAccessTokenErrorMessage);
        });

        test('Should throw an error when url is undefined and access token is undefined', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(undefined, undefined), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when url is undefined and access token is an empty string', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(undefined, ''), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when url is undefined and access token is valid', () => {
            const options = vstsHelpers.buildRestApiBasicAuthRequestOptions(undefined, accessToken);
            assert.deepEqual(options.url, undefined);
            assert.deepEqual(options.headers.Authorization, expectedAuthValue);
        });

        test('Should throw an error when url is valid and access token is null', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(url, null), invalidAccessTokenErrorMessage);
        });

        test('Should throw an error when url is valid and access token is undefined', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(url, undefined), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when url is valid and access token is an empty string', () => {
            assert.throws(() => vstsHelpers.buildRestApiBasicAuthRequestOptions(url, ''), invalidAccessTokenErrorMessage);
        });

        test('Should return the options when url is valid and access token is valid', () => {
            const options = vstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);
            assert.deepEqual(options.url, url);
            assert.deepEqual(options.headers.Authorization, expectedAuthValue);
        });
    });
});