'use strict';

import request = require('request');
import helpers = require('./../helpers');
import IVstsUserService = require('./../interfaces/vsts-user-service');
import vstsConstants = require('./../vsts-constants');
import VstsGraphApiUserListResponse = require('./../models/vsts-graph-api-user-list-response');
import VstsHelpers = require('./../vsts-helpers');
import VstsStorageKey = require('./../models/vsts-storage-key');
import VstsUser = require('./../models/vsts-user');

/**
 * Implementation of the @see {@link IVstsUserService} interface that
 * interacts with the VSTS Graph APIs to provide User related functions.
 *
 * @class VstsGraphApiUserService
 * @implements {IVstsUserService}
 *
 * @link https://{{account}}.vssps.visualstudio.com/_apis/graph/users
 */
class VstsGraphApiUserService implements IVstsUserService {
    /**
     * Retrieves all users from a VSTS account that are sourced from
     * an Azure Active Directory (AAD) Tenant.
     *
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     *
     * @returns {Promise<VstsUser[]>}
     * @memberof IVstsUserService
     */
    public async getAADUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return await this.getAllVstsUsers(vstsAccountName, accessToken, [ vstsConstants.aadGraphSubjectType ]);
    }

    /**
     * Retrieves all users from a VSTS account.
     *
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     *
     * @returns {Promise<VstsUser[]>}
     * @memberof IVstsUserService
     */
    public async getAllUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return await this.getAllVstsUsers(vstsAccountName, accessToken);
    }

    /**
     * Retrieves the VSTS Storage Key for the specified user.
     *
     * @private
     * @param {VstsUser} user - The VSTS User of the storage key to retrieve.
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     *
     * @returns {Promise<VstsStorageKey>}
     * @memberof VstsGraphApiUserService
     */
    private getUserStorageKey(user: VstsUser, vstsAccountName: string, accessToken: string): Promise<VstsStorageKey> {
        return new Promise<VstsStorageKey>((resolve) => {
            try {
                const url = VstsHelpers.buildStorageKeyApiUrl(vstsAccountName, user);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);

                request.get(options, (err, response, data: string) => {
                    if (!err && response.statusCode === 200) {
                        const storageKey: VstsStorageKey = JSON.parse(data);
                        resolve(storageKey);
                    } else {
                        resolve(null);
                    }
                });
            } catch (err) {
                resolve(null);
            }
        });
    }

    /**
     * Creates the Graph API User List Response object based on values in the
     * HTTP response returned by the Graph API.
     *
     * @private
     * @param {request.RequestResponse} response - The HTTP response (from request.js).
     *
     * @returns {VstsGraphApiUserListResponse}
     */
    private initializeGraphApiUserListResponse(response: request.RequestResponse): VstsGraphApiUserListResponse {
        const graphApiUserListResponse = new VstsGraphApiUserListResponse();
        const continuationToken = <string> response.headers[VstsHelpers.vstsApiContinuationTokenHeader];

        if (continuationToken) {
            graphApiUserListResponse.moreUsersExist = true;
            graphApiUserListResponse.continuationToken = continuationToken;
        }

        return graphApiUserListResponse;
    }

    /**
     * Retrieves a set of VSTS users. Note this may only be a subset of the users
     * on a VSTS account depending on how many total users there are in the account.
     *
     * @private
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     * @param {*} httpRequestOptions - The HTTP Request options (used with request.js)
     *
     * @returns {Promise<VstsGraphApiUserListResponse>}
     */
    // tslint:disable-next-line:no-any
    private getVstsUsers(vstsAccountName: string, accessToken: string, httpRequestOptions: any): Promise<VstsGraphApiUserListResponse> {
        return new Promise<VstsGraphApiUserListResponse>((resolve, reject) => {
            try {
                // tslint:disable-next-line:max-func-body-length
                request.get(httpRequestOptions, async (err, response, data: string) => {
                    if (!err && response.statusCode === 200) {
                        try {
                            const graphApiUserListResponse = this.initializeGraphApiUserListResponse(response);
                            const users = JSON.parse(data).value;

                            await Promise.all(users.map(async u => {
                                u.storageKey = await this.getUserStorageKey(u, vstsAccountName, accessToken);
                                if (u.storageKey) {
                                    graphApiUserListResponse.vstsUsers.push(u);
                                }
                            }));
                            resolve(graphApiUserListResponse);
                        } catch (err) {
                            reject(new Error('Invalid or unexpected JSON encountered. Unable to determine VSTS Users.'));
                        }
                    }
                    reject(new Error('VSTS User API Call Failed.'));
                });
            } catch (err) {
                const errorMessage = 'Encountered an error while retrieving VSTS users. Error details: ';
                reject(helpers.buildError(errorMessage, err));
            }
        });
    }

    /**
     * Retrieves all the users from the specified VSTS account.
     *
     * @private
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     * @param {string[]?} [subjectTypes] - The optional paramater to specify the subject types of users to retrieve.
     *
     * @memberof VstsGraphApiUserService
     * @returns {Promise<VstsUser[]>}
     */
    private getAllVstsUsers(vstsAccountName: string, accessToken: string, subjectTypes?: string[]): Promise<VstsUser[]> {
        // eslint-disable-next-line max-statements
        return new Promise<VstsUser[]>(async (resolve, reject) => {
            try {
                const url = VstsHelpers.buildGraphApiUsersUrl(vstsAccountName, subjectTypes);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);
                let users: VstsUser[] = [];
                let graphApiUserListResponse = await this.getVstsUsers(vstsAccountName, accessToken, options);
                users = users.concat(graphApiUserListResponse.vstsUsers);

                while (graphApiUserListResponse.moreUsersExist) {
                    options.url = VstsHelpers.appendContinuationToken(url, graphApiUserListResponse.continuationToken);
                    graphApiUserListResponse = await this.getVstsUsers(vstsAccountName, accessToken, options);
                    users = users.concat(graphApiUserListResponse.vstsUsers);
                }

                resolve(users);
            } catch (err) {
                const errorMessage = 'Encountered a fatal error while retrieving the complete set of VSTS users. ';
                reject(helpers.buildError(errorMessage, err));
            }
        });
    }
}

export = VstsGraphApiUserService;