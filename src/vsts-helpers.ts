'use strict';

import formatValidator = require('./format-validator');
import IsoDateRange = require('./models/iso-date-range');
import IUsageRecordOriginValidator = require('./interfaces/usage-record-origin-validator');
import VstsUsageRecord = require('./models/vsts-usage-record');
import VstsUser = require('./models/vsts-user');

/**
 * Converts a VSTS Personal Access Token (PAT) into the necessary format
 * for usage in the headers of a call to the VSTS Rest APIs.
 *
 * @param accessToken
 * @throws {InvalidArgumentException} Will throw an error if the accessToken
 * is null or undefined.
 */
export const convertPatToApiHeader = (accessToken: string) => {
    if (!accessToken) {
        throw new Error('Invalid access token.');
    }
    return Buffer.from('' + ':' + accessToken).toString('base64');
};

/**
 * Validates the account name according to standards of valid VSTS account names.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const validateAccountName = (accountName: string) => {
    const errMessage = 'Invalid account name.';

    if (!accountName) {
        throw new Error(errMessage);
    }

    // Must start with a letter or number, can be followed by letters, numbers, or hyphens, and
    // must end with a letter or number.
    const regEx = new RegExp('^[a-zA-Z0-9]{1}[a-zA-Z0-9-]*[a-zA-Z0-9]{1}$');
    if (!regEx.test(accountName)) {
        throw new Error(errMessage);
    }
};

/**
 * Validates the specified VSTS User Id is the correct format for VSTS.
 *
 * @param {string} userId - The Id of a VSTS user to validate.
 * @throws {Error} Will throw an error if the specified User Id is invalid.
 */
export const validateUserIdFormat = (userId: string) => {
    if (!formatValidator.isValidGuid(userId)) {
        throw new Error('Invalid User Id. User Id must be a valid GUID.');
    }
};

const protocol = 'https://';

/**
 * The core URL segment of VSTS REST APIs.
 */
export const vstsCoreApiUrlSegment = '.visualstudio.com/_apis/';

/**
 * The core URL segment of the VSTS Graph APIs
 */
export const vstsGraphApiUrlSegment = '.vssps' + vstsCoreApiUrlSegment + 'graph/';

/**
 * The core URL segement of the VSTS Utilization APIs.
 */
export const vstsUtilizationApiUrlSegment = vstsCoreApiUrlSegment + 'utilization/';

/**
 * The HTTP header VSTS uses to provide a Continuation Token on APIs.
 */
export const vstsApiContinuationTokenHeader = 'x-ms-continuationtoken';

/**
 * The HTTP query parameter for a VSTS API Continuation Token.
 */
export const vstsApiContinuationTokenQueryParameter = 'continuationToken';

/**
 * The HTTP header VSTS uses when an account is being throttled to
 * inform the client how long to wait before making subsequent API calls.
 */
export const vstsApiRetryAfterHeader = 'retry-after';

/**
 * Helper for forming REST API Urls.
 *
 * @param accountName
 * @param urlSegment
 *
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
const buildVstsApiUrl = (accountName: string, urlSegment: string) => {
    validateAccountName(accountName);
    return protocol + accountName + urlSegment;
};

/**
 * Builds the full URL of the VSTS Graph API.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildGraphApiUrl = (accountName: string) => {
    return buildVstsApiUrl(accountName, vstsGraphApiUrlSegment);
};

/**
 * Builds the full URL of the VSTS Graph User API.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildGraphApiUsersUrl = (accountName: string, subjectTypes?: string[]) => {
    const url = buildGraphApiUrl(accountName) + 'users?subjectTypes=';

    if (subjectTypes) {
        return url + subjectTypes.toString();
    } else {
        return url;
    }
};

/**
 * Builds the Url for the Utilization domain of the VSTS Rest APIs.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildUtilizationApiUrl = (accountName: string) => {
    return buildVstsApiUrl(accountName, vstsUtilizationApiUrlSegment);
};

/**
 * Builds the full url for the UsageSummary VSTS Rest API.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards, if the user identifier is null, undefined or invalid,
 * or if the dateRange is not a valid instance of the IsoDateRange class.
 */
export const buildUtilizationUsageSummaryApiUrl = (accountName: string, userId: string, dateRange: IsoDateRange) => {
    if (!dateRange) {
        throw new Error('Invalid value supplied for dateRange parameter. Must be a valid IsoDateRange instance.');
    }

    let url = buildUtilizationApiUrl(accountName) + 'usagesummary';
    url += '?queryCriteria[userId]=' + userId + '&queryCriteria[startTime]=' + dateRange.isoStartTime + '&queryCriteria[endTime]=' + dateRange.isoEndTime;
    url += '&queryCriteria[columns]=user&queryCriteria[columns]=userAgent&queryCriteria[columns]=ipAddress';
    url += '&queryCriteria[columns]=startTime&queryCriteria[columns]=application&queryCriteria[columns]=command&queryCriteria[columns]=status';
    url += '&queryCriteria[columns]=authenticationMechanism';

    return url;
};

/**
 * Builds the full url for the top level UsageSummary VSTS Rest API that simply lists the set of
 * users that accessed the VSTS account during that time period.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards, if the user identifier is null, undefined or invalid,
 * or if the dateRange is not a valid instance of the IsoDateRange class.
 */
export const buildUtilizationUsageSummaryActiveUsersApiUrl = (accountName: string, dateRange: IsoDateRange) => {
    if (!dateRange) {
        throw new Error('Invalid value supplied for dateRange parameter. Must be a valid IsoDateRange instance.');
    }

    let url = buildUtilizationApiUrl(accountName) + 'usagesummary';
    url += '?queryCriteria[userId]=&queryCriteria[startTime]=' + dateRange.isoStartTime + '&queryCriteria[endTime]=' + dateRange.isoEndTime;
    url += '&queryCriteria[columns]=user';

    return url;
};

/**
 * Builds the URL for making Storage Key API calls.
 * @param {string} accountName - The name of the VSTS account.
 * @param {VstsUser} user - The target user for the desired storage key.
 */
export const buildStorageKeyApiUrl = (accountName: string, user: VstsUser): string => {
    if (!user) {
        throw new Error('Invalid parameter. Must specify a valid user');
    }

    const links = user._links;

    if (links && links.storageKey && links.storageKey.href) {
        return links.storageKey.href;
    } else {
        let baseUrl = buildGraphApiUrl(accountName);
        baseUrl += 'storagekeys/' + user.descriptor;
        return baseUrl;
    }
};

/**
 * Builds the Request options object with basic authentication to make VSTS REST API calls.
 *
 * @param {string} apiUrl - The url of the targeted VSTS API.
 * @param {string} accessToken - The Personal Access Token to authenticate with.
 *
 * @throws {InvalidArgumentException} Will throw an error if the accessToken is null or undefined.
 *
 */
export const buildRestApiBasicAuthRequestOptions = (apiUrl: string, accessToken: string) => {
    const auth = convertPatToApiHeader(accessToken);

    return {
        url: apiUrl,
        headers: {
            'Authorization': 'basic ' + auth
        }
    };
};

/**
 * Creates an updated version of the specified API url that includes the Continuation Token
 * as a query parameter on the url.
 *
 * @param apiUrl
 * @param continuationToken
 * @throws {InvalidArgumentException} Will throw an error if the accessToken is null or undefined.
 *
 * @returns a string representing an updated API url.
 */
export const appendContinuationToken = (apiUrl: string, continuationToken: string): string => {
    if (!apiUrl || !continuationToken) {
        throw new Error('Invalid API url and/or continuationToken.');
    }

    const queryParameter = vstsApiContinuationTokenQueryParameter + '=' + continuationToken;
    const parameterSeparator = apiUrl.indexOf('?') < 0 ? '?' : '&';

    return apiUrl + parameterSeparator + queryParameter;
};

/**
 * Determines whether the specified usageRecord is representative of
 * an internal VSTS service-to-service call.
 *
 * @param {VstsUsageRecord} usageRecord - The usage record to review.
 * @returns {boolean}
 */
export const isInternalVstsServiceToServiceCall = (usageRecord: VstsUsageRecord, usageRecordOriginValidators: IUsageRecordOriginValidator[]): boolean => {
    if (!usageRecord || !usageRecordOriginValidators) {
        throw new Error('Invalid parameter(s). Must specify a valid usageRecord and usageRecordOriginValidators');
    }

    for (const usageRecordOriginValidator of usageRecordOriginValidators) {
        const isInternalVstsApiCall = usageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(usageRecord);

        if (isInternalVstsApiCall) {
            return true;
        }
    }

    return false;
};