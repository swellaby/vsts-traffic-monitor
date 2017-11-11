'use strict';

import request = require('request');
import helpers = require('./../helpers');
import IVstsGraphApiUserResponse = require('./../interfaces/vsts-graph-api-user-response');
import IVstsUserService = require('./../interfaces/vsts-user-service');
import vstsConstants = require('./../vsts-constants');
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
        return await this.getVstsUsers(vstsAccountName, accessToken, [ vstsConstants.aadGraphSubjectType ]);
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
        return await this.getVstsUsers(vstsAccountName, accessToken);
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
        return new Promise<VstsStorageKey>((resolve, reject) => {
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
     * Retrieves users from the specified VSTS account.
     *
     * @private
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     * @param {string[]?} [subjectTypes] - The optional paramater to specify the subject types of users to retrieve.
     *
     * @memberof VstsGraphApiUserService
     * @returns {Promise<VstsUser[]>}
     */
    private getVstsUsers(vstsAccountName: string, accessToken: string, subjectTypes?: string[]): Promise<VstsUser[]> {
        return new Promise<VstsUser[]>((resolve, reject) => {
            try {
                const url = VstsHelpers.buildGraphApiUsersUrl(vstsAccountName, subjectTypes);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);

                request.get(options, async (err, response, data: string) => {
                    if (!err && response.statusCode === 200) {
                        try {
                            const users = JSON.parse(data).value;
                            await Promise.all(users.map(async u => {
                                u.storageKey = await this.getUserStorageKey(u, vstsAccountName, accessToken);
                            }));
                            resolve(users.filter(u => u.storageKey));
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
}

export = VstsGraphApiUserService;