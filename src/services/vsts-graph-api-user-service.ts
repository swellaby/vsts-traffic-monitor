'use strict';

import request = require('request');
import helpers = require('./../helpers');
import IVstsGraphApiUserResponse = require('./../interfaces/vsts-graph-api-user-response');
import VstsHelpers = require('./../vsts-helpers');
import VstsUser = require('./../models/vsts-user');
import IVstsUserService = require('./../interfaces/vsts-user-service');

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
     * @memberOf VstsGraphApiUserService
     */
    public async getAADUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return new Promise<VstsUser[]>(async (resolve, reject) => {
            try {
                const allUsers = await this.getAllUsers(vstsAccountName, accessToken);
                if (!allUsers) {
                    reject(new Error('Encountered an error retrieving user information from VSTS.'));
                }
                resolve(allUsers.filter(u => u.origin.toLowerCase() === 'aad'));
            } catch (err) {
                const errorMessage = 'Encountered an error while retrieving VSTS users from AAD. Error details: ';
                reject(helpers.buildError(errorMessage, err));
            }
        });
    }

    /**
     * Retrieves all users from a VSTS account.
     *
     * @param {string} vstsAccountName - The name of the VSTS Account.
     * @param {string} accessToken - The Personal Access Token to authenticate with.
     *
     * @returns {Promise<VstsUser[]>}
     * @memberOf VstsGraphApiUserService
     */
    public async getAllUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return new Promise<VstsUser[]>((resolve, reject) => {
            try {
                const url = VstsHelpers.buildGraphApiUsersUrl(vstsAccountName);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);

                // tslint:disable-next-line:no-any
                request.get(options, (err: any, response: any, data: string) => {
                    if (!err && response.statusCode === 200) {
                        try {
                            const apiResponse: IVstsGraphApiUserResponse = JSON.parse(data);
                            resolve(apiResponse.value);
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