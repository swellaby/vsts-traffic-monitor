'use strict';

import helpers = require('./helpers');

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
    return new Buffer('' + ':' + accessToken).toString('base64');
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
    const regEx = new RegExp('^[a-zA-Z0-9]{1}[a-zA-Z0-9\-]*[a-zA-Z0-9]{1}$');
    if (!regEx.test(accountName)) {
        throw new Error(errMessage);
    }
}

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
}

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
export const buildGraphApiUsersUrl = (accountName: string) => {
    return buildGraphApiUrl(accountName) + 'users';
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
}

/**
 * Builds the full url for the UsageSummary VSTS Rest API.
 *
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildUtilizationUsageSummaryApiUrl = (accountName: string) => {
    return buildUtilizationApiUrl(accountName) + 'usagesummary';
}

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
    }
};

/**
 * Validates the specified VSTS User Id is the correct format for VSTS.
 *
 * @param {string} userId - The Id of a VSTS user to validate.
 * @throws {Error} Will throw an error if the specified User Id is invalid.
 */
export const validateUserIdFormat = (userId: string) => {
    if (!helpers.isValidGuid(userId)) {
        throw new Error('Invalid User Id. User Id must be a valid GUID.');
    }}