'use strict';

import Chai = require('chai');
import Sinon = require('sinon');

import IVstsGraphLink = require('./../../src/interfaces/vsts-graph-link');
import IVstsUserGraphLinks = require('./../../src/interfaces/vsts-user-graph-links');
import formatValidator = require('./../../src/format-validator');
import testHelpers = require('./test-helpers');
import vstsConstants = require('./../../src/vsts-constants');
import vstsHelpers = require('./../../src/vsts-helpers');
import VstsUser = require('./../../src/models/vsts-user');

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
            const actualUrl = vstsHelpers.buildGraphApiUrl(accountName);
            assert.deepEqual(actualUrl, expectedGraphApiUrl);
        });

        test('Should have correct value for exported Graph API Url segment', () => {
            assert.deepEqual(vstsHelpers.vstsGraphApiUrlSegment, graphApiUrlSegment);
        });
    });

    suite('buildGraphApiUsersUrl Suite:', () => {
        const expectedUrlBase = expectedGraphApiUrl + 'users?subjectTypes=';

        test('Should throw an error when account name is null', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUsersUrl(null), invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined', () => {
            assert.throws(() => vstsHelpers.buildGraphApiUsersUrl(undefined), invalidAccountNameErrorMessage);
        });

        test('Should return correct url string when account name is valid and no subject types are specified', () => {
            const actualUrl = vstsHelpers.buildGraphApiUsersUrl(accountName);
            assert.deepEqual(actualUrl, expectedUrlBase);
        });

        test('Should return correct url string when account name is valid and subject types are null', () => {
            const actualUrl = vstsHelpers.buildGraphApiUsersUrl(accountName, null);
            assert.deepEqual(actualUrl, expectedUrlBase);
        });

        test('Should return correct url string when account name is valid and subject types are undefined', () => {
            const actualUrl = vstsHelpers.buildGraphApiUsersUrl(accountName, undefined);
            assert.deepEqual(actualUrl, expectedUrlBase);
        });

        test('Should return correct url string when account name is valid and multiple subject types are specified', () => {
            const subjectTypes = [ vstsConstants.aadGraphSubjectType, vstsConstants.msaGraphSubjectType ];
            const expectedUrl = expectedUrlBase + vstsConstants.aadGraphSubjectType + ',' + vstsConstants.msaGraphSubjectType;
            const actualUrl = vstsHelpers.buildGraphApiUsersUrl(accountName, subjectTypes);
            assert.deepEqual(actualUrl, expectedUrl);
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
            assert.deepEqual(actualUrl, expectedUrl);
        });

        test('Should have correct value for exported Graph API Url segment', () => {
            assert.deepEqual(vstsHelpers.vstsUtilizationApiUrlSegment, utilizationApiUrlSgement);
        });
    });

    suite('buildUtilizationUsageSummaryApiUrl Suite:', () => {
        const dateRangeErrorMessage = 'Invalid value supplied for dateRange parameter. Must be a valid IsoDateRange instance.';
        const invalidUserId = '!@%FGHF#$f';

        test('Should throw an error when account name is null, user id is null, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, null, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is null, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error url string when account name is null, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, undefined, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, '', testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is null, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(null, invalidUserId, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
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
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, null, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error url string when account name is undefined, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, undefined, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, '', testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is undefined, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(undefined, invalidUserId, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
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
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is null, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, null, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is undefined, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, undefined), dateRangeErrorMessage);
        });

        test('Should throw an error url string when account name is invalid, user id is undefined, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, undefined, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', undefined), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is an empty string, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, '', testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, undefined),
                dateRangeErrorMessage);
        });

        test('Should throw an error when account name is invalid, user id is invalid, and dateRange is valid', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(invalidAccountName, invalidUserId, testHelpers.validIsoDateRange),
                invalidAccountNameErrorMessage);
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
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is null, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, undefined), dateRangeErrorMessage);
        });

        // test('Should throw an error when account name is valid, user id is null, and dateRange is valid', () => {
        //     assert.throws(
        //         () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, null, testHelpers.validIsoDateRange),
        //         invalidAccountNameErrorMessage);
        // });

        // test('Should throw an error when account name is valid, user id is undefined, and dateRange is null', () => {
        //     assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, null), dateRangeErrorMessage);
        // });

        test('Should throw an error when account name is valid, user id is undefined, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, undefined), dateRangeErrorMessage);
        });

        // test('Should throw an error url string when account name is valid, user id is undefined, and dateRange is valid', () => {
        //     assert.throws(
        //         () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, undefined, testHelpers.validIsoDateRange),
        //         invalidAccountNameErrorMessage);
        // });

        test('Should throw an error when account name is valid, user id is an empty string, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is an empty string, and dateRange is undefined', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', undefined), dateRangeErrorMessage);
        });

        // test('Should throw an error when account name is valid, user id is an empty string, and dateRange is valid', () => {
        //     assert.throws(
        //         () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, '', testHelpers.validIsoDateRange),
        //         invalidAccountNameErrorMessage);
        // });

        test('Should throw an error when account name is valid, user id is invalid, and dateRange is null', () => {
            assert.throws(() => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, null), dateRangeErrorMessage);
        });

        test('Should throw an error when account name is valid, user id is invalid, and dateRange is undefined', () => {
            assert.throws(
                () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, undefined),
                dateRangeErrorMessage);
        });

        // test('Should throw an error when account name is valid, user id is invalid, and dateRange is valid', () => {
        //     assert.throws(
        //         () => vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, invalidUserId, testHelpers.validIsoDateRange),
        //         invalidAccountNameErrorMessage);
        // });

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
            const baseUrl = expectedUtilizationApiUrl + 'usagesummary?queryCriteria[userId]=';
            let expectedUrl = baseUrl + testHelpers.sampleGuid + '&queryCriteria[startTime]=' + dateRange.isoStartTime + '&queryCriteria[endTime]=' + dateRange.isoEndTime;
            expectedUrl += '&queryCriteria[columns]=user&queryCriteria[columns]=userAgent&queryCriteria[columns]=ipAddress';
            expectedUrl += '&queryCriteria[columns]=startTime&queryCriteria[columns]=application&queryCriteria[columns]=command&queryCriteria[columns]=status';
            expectedUrl += '&queryCriteria[columns]=authenticationMechanism';

            const actualUrl = vstsHelpers.buildUtilizationUsageSummaryApiUrl(accountName, testHelpers.sampleGuid, testHelpers.validIsoDateRange);
            assert.deepEqual(actualUrl, expectedUrl);
        });
    });

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

    suite('buildStorageKeyApiUrl Suite:', () => {
        const invalidUserErrorMessage = 'Invalid parameter. Must specify a valid user';
        const user: VstsUser = testHelpers.buildVstsUser('link', 'aad');
        let graphLinks: IVstsUserGraphLinks;
        let storageKeyLink: IVstsGraphLink;
        const expectedStorageKeyUrl = testHelpers.sampleStorageKeyUrl;
        const descriptor = 'aad.AaBbCCIyM2ItZmY2Yy03ODBiLWEwMzYtMGQzMzc5YjY0ZWJk';
        const composedStorageKeyUrl = expectedGraphApiUrl + 'storagekeys/' + descriptor;

        setup(() => {
            storageKeyLink = <IVstsGraphLink> {
                href: expectedStorageKeyUrl
            };
            graphLinks = <IVstsUserGraphLinks> {
                storageKey: storageKeyLink
            };
            user._links = graphLinks;
            user.descriptor = descriptor;
        });

        teardown(() => {
            user._links = null;
        });

        test('Should throw error when account name is null and user is null', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(null, null), invalidUserErrorMessage);
        });

        test('Should throw an error when account name is null and user is undefined', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(null, undefined), invalidUserErrorMessage);
        });

        test('Should throw error when account name is null and user graph links are null', () => {
            user._links = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(null, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is null and user graph links storage key is null', () => {
            user._links.storageKey = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(null, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is null and user graph links storage key href is null', () => {
            user._links.storageKey.href = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(null, user), invalidAccountNameErrorMessage);
        });

        test('Should return correct url when account name is null and user storage key href is valid', () => {
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(null, user);
            assert.deepEqual(storageKeyApiUrl, expectedStorageKeyUrl);
        });

        test('Should throw error when account name is undefined and user is null', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(undefined, null), invalidUserErrorMessage);
        });

        test('Should throw an error when account name is undefined and user is undefined', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(undefined, undefined), invalidUserErrorMessage);
        });

        test('Should throw error when account name is undefined and user graph links are null', () => {
            user._links = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(undefined, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is undefined and user graph links storage key is null', () => {
            user._links.storageKey = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(undefined, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is undefined and user graph links storage key href is null', () => {
            user._links.storageKey.href = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(undefined, user), invalidAccountNameErrorMessage);
        });

        test('Should return correct url when account name is undefined and user storage key href is valid', () => {
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(undefined, user);
            assert.deepEqual(storageKeyApiUrl, expectedStorageKeyUrl);
        });

        test('Should throw error when account name is empty and user is null', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, null), invalidUserErrorMessage);
        });

        test('Should throw an error when account name is empty and user is undefined', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, undefined), invalidUserErrorMessage);
        });

        test('Should throw error when account name is empty and user graph links are null', () => {
            user._links = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is empty and user graph links storage key is null', () => {
            user._links.storageKey = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is empty and user graph links storage key href is null', () => {
            user._links.storageKey.href = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, user), invalidAccountNameErrorMessage);
        });

        test('Should return correct url when account name is empty and user storage key href is valid', () => {
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(testHelpers.emptyString, user);
            assert.deepEqual(storageKeyApiUrl, expectedStorageKeyUrl);
        });

        test('Should throw error when account name is invalid and user is null', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, null), invalidUserErrorMessage);
        });

        test('Should throw an error when account name is invalid and user is undefined', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, undefined), invalidUserErrorMessage);
        });

        test('Should throw error when account name is invalid and user graph links are null', () => {
            user._links = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is invalid and user graph links storage key is null', () => {
            user._links.storageKey = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, user), invalidAccountNameErrorMessage);
        });

        test('Should throw error when account name is invalid and user graph links storage key href is null', () => {
            user._links.storageKey.href = null;
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, user), invalidAccountNameErrorMessage);
        });

        test('Should return correct url when account name is invalid and user storage key href is valid', () => {
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(invalidAccountName, user);
            assert.deepEqual(storageKeyApiUrl, expectedStorageKeyUrl);
        });

        test('Should throw error when account name is valid and user is null', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(accountName, null), invalidUserErrorMessage);
        });

        test('Should throw an error when account name is valid and user is undefined', () => {
            assert.throws(() => vstsHelpers.buildStorageKeyApiUrl(accountName, undefined), invalidUserErrorMessage);
        });

        test('Should throw error when account name is valid and user graph links are null', () => {
            user._links = null;
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(accountName, user);
            assert.deepEqual(storageKeyApiUrl, composedStorageKeyUrl);
        });

        test('Should throw error when account name is valid and user graph links storage key is null', () => {
            user._links.storageKey = null;
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(accountName, user);
            assert.deepEqual(storageKeyApiUrl, composedStorageKeyUrl);
        });

        test('Should throw error when account name is valid and user graph links storage key href is null', () => {
            user._links.storageKey.href = null;
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(accountName, user);
            assert.deepEqual(storageKeyApiUrl, composedStorageKeyUrl);
        });

        test('Should return correct url when account name is valid and user storage key href is valid', () => {
            const storageKeyApiUrl = vstsHelpers.buildStorageKeyApiUrl(accountName, user);
            assert.deepEqual(storageKeyApiUrl, expectedStorageKeyUrl);
        });
    });

    suite('vstsApiContinuationTokenHeader Suite', () => {
        test('Should have the correct continuationToken HTTP header value', () => {
            assert.deepEqual(vstsHelpers.vstsApiContinuationTokenHeader, 'x-ms-continuationtoken');
        });
    });

    suite('vstsApiContinuationTokenQueryParameter Suite:', () => {
        test('Should have the correct continuationToken Query Parameter value', () => {
            assert.deepEqual(vstsHelpers.vstsApiContinuationTokenQueryParameter, 'continuationToken');
        });
    });

    suite('appendContinuationToken Suite:', () => {
        const invalidApiUrlErrorMessage = 'Invalid API url and/or continuationToken.';
        const apiUrlBase = 'https://awesomeness.visualstudio.com/_apis/utilization/usagesummary';
        const existingParamApiUrl = apiUrlBase + '?queryCriteria[userId]=&queryCriteria[columns]=ipAddress';
        const queryParameterSuffix = 'continuationToken=' + testHelpers.continuationToken;
        const expectedExistingParamsApiUrl = existingParamApiUrl + '&' + queryParameterSuffix;
        const expectedNoExistingParamsApiUrl = apiUrlBase + '?' + queryParameterSuffix;

        test('Should throw an error when url is null and continuationToken is null', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(null, null), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is null and continuationToken is undefined', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(null, undefined), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is null and continuationToken is empty', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(null, testHelpers.emptyString), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is null and continuationToken is valid', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(null, testHelpers.continuationToken), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is undefined and continuationToken is null', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(undefined, null), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is undefined and continuationToken is undefined', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(undefined, undefined), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is undefined and continuationToken is empty', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(undefined, testHelpers.emptyString), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is undefined and continuationToken is valid', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(undefined, testHelpers.continuationToken), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is empty and continuationToken is null', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(testHelpers.emptyString, null), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is empty and continuationToken is undefined', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(testHelpers.emptyString, undefined), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is empty and continuationToken is empty', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(testHelpers.emptyString, testHelpers.emptyString), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is empty and continuationToken is valid', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(testHelpers.emptyString, testHelpers.continuationToken), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is valid and continuationToken is null', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(apiUrlBase, null), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is valid and continuationToken is undefined', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(apiUrlBase, undefined), invalidApiUrlErrorMessage);
        });

        test('Should throw an error when url is valid and continuationToken is empty', () => {
            assert.throws(() => vstsHelpers.appendContinuationToken(apiUrlBase, testHelpers.emptyString), invalidApiUrlErrorMessage);
        });

        test('Should return correct url with valid continuationToken and apiUrl with existing query params', () => {
            assert.deepEqual(vstsHelpers.appendContinuationToken(existingParamApiUrl, testHelpers.continuationToken), expectedExistingParamsApiUrl);
        });

        test('Should return correct url with valid continuationToken and apiUrl without existing query params', () => {
            assert.deepEqual(vstsHelpers.appendContinuationToken(apiUrlBase, testHelpers.continuationToken), expectedNoExistingParamsApiUrl);
        });
    });

    suite('vstsApiRetryAfterHeader Suite', () => {
        test('Should have the correct retry-after HTTP header value', () => {
            assert.deepEqual(vstsHelpers.vstsApiRetryAfterHeader, 'retry-after');
        });
    });
});