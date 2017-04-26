'use strict';

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

/**
 * The core URL segmant of the VSTS Graph API's
 */
export const graphApiUrlSegment = '.vssps.visualstudio.com/_apis/graph/';

/**
 * Builds the full URL of the VSTS Graph API.
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildGraphApiUrl = (accountName: string) => {
    validateAccountName(accountName);
    return 'https://' +  accountName + graphApiUrlSegment;
};

/**
 * Builds the full URL of the VSTS Graph User API.
 * @param accountName
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 */
export const buildGraphApiUsersUrl = (accountName: string) => {
    return buildGraphApiUrl(accountName) + 'users';
};