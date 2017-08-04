'use strict';

import Chai = require('chai');
import Sinon = require('sinon');

import formatValidator = require('./../../src/format-validator');
import testHelpers = require('./test-helpers');
import vstsHelpers = require('./../../src/vsts-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/vsts-helpers.ts}
 */
suite('VSTS Helpers Suite:', () => {
    const invalidAccountNameErrorMessage = 'Invalid account name.';
    const invalidAccessTokenErrorMessage = 'Invalid access token.';
    const invalidUserIdErrorMessage = 'Invalid User Id. User Id must be a valid GUID.';
    const protocol = 'https://';
    const accountName = 'swellaby';
    const invalidAccountName = '+86sdf- &&%1!';
    const graphApiUrlSegment = '.vssps.visualstudio.com/_apis/graph/';
    const expectedGraphApiUrl = protocol + accountName + graphApiUrlSegment;
    const utilizationApiUrlSgement = '.visualstudio.com/_apis/utilization/';
    const expectedUtilizationApiUrl = protocol + accountName + utilizationApiUrlSgement;
    const accessToken = 'Hello World';
    const expectedBase64AccessToken = 'OkhlbGxvIFdvcmxk';
    const sandbox = Sinon.sandbox.create();

    teardown(() => {
        sandbox.restore();
    });

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

    suite('validateUserIdFormat Suite:', () => {
        let formatValidatorIsValidGuidStub: Sinon.SinonStub;

        setup(() => {
            formatValidatorIsValidGuidStub = sandbox.stub(formatValidator, 'isValidGuid').callsFake(() => { return false; });
        });

        test('Should throw an error when userId is null', () => {
            assert.throws(() => vstsHelpers.validateUserIdFormat(null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when userId is undefined', () => {
            assert.throws(() => vstsHelpers.validateUserIdFormat(undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when userId is invalid', () => {
            assert.throws(() => vstsHelpers.validateUserIdFormat('abc'), invalidUserIdErrorMessage);
        });

        test('Should not throw an error when userId is valid', () => {
            formatValidatorIsValidGuidStub.callsFake(() => { return true; });
            assert.doesNotThrow(() => vstsHelpers.validateUserIdFormat(testHelpers.sampleGuid), invalidUserIdErrorMessage);
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

    // eslint-disable-next-line max-statements
    suite('buildUtilizationUsageSummaryApiUrl Suite:', () => {
        const dateRangeErrorMessage = 'Invalid value supplied for dateRange parameter. Must be a valid IsoDateRange instance.';
        const invalidUserId = '!@%FGHF#$f';

        test('Should throw an error when account name is null, user id is null, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error url string when account name is null, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is null, user id is valid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, testHelpers.sampleGuid, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is valid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, testHelpers.sampleGuid, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is valid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, testHelpers.sampleGuid, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is null, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error url string when account name is undefined, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is valid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, testHelpers.sampleGuid, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is valid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, testHelpers.sampleGuid, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is valid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, testHelpers.sampleGuid, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is null, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error url string when account name is invalid, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, undefined),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is valid, and dateRange is null', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, testHelpers.sampleGuid, null),
                dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is valid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, testHelpers.sampleGuid, undefined),
                dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is valid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, testHelpers.sampleGuid, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is null, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error url string when account name is valid, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', undefined), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, null), invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is invalid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, undefined),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, testHelpers.validIsoDateRange),
                invalidUserIdErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is valid, and dateRange is null', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, testHelpers.sampleGuid, null),
                dateRangeErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is valid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, testHelpers.sampleGuid, undefined),
                dateRangeErrorMessage);
        });

        test('Should return correct URL when account name is valid, user id is valid, and dateRange is valid', () => {
            const dateRange = testHelpers.validIsoDateRange;
            const baseUrl = expectedUtilizationApiUrl + 'usagesummary?userId=';
            const expectedUrl = baseUrl + testHelpers.sampleGuid + '&startTime=' + dateRange.isoStartTime + '&endTime=' + dateRange.isoEndTime;
            const actualUrl = vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, testHelpers.sampleGuid, testHelpers.validIsoDateRange);
            assert.deepEqual(actualUrl, expectedUrl);
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