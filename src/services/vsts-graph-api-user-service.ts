'use strict';

import request = require('request');
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
     * @param {string} vstsAccountName
     * @param {string} accessToken
     *
     * @returns {Promise<VstsUser[]>}
     * @memberOf VstsGraphApiUserService
     */
    public async getAADUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return new Promise<VstsUser[]>(async (resolve, reject) => {
            try {
                const allUsers = await this.getAllUsers(vstsAccountName, accessToken);
                resolve(allUsers.filter(u => u.origin.toLowerCase() === 'aad'));
            } catch (err) {
                let errorMessage = 'Encountered an error while retrieving VSTS users from AAD. Error details: ';
                if (err) {
                    errorMessage += err.message;
                }
                reject(new Error(errorMessage));
            }
        });
    }

    /**
     * Retrieves all users from a VSTS account.
     *
     * @param {string} vstsAccountName
     * @param {string} accessToken
     *
     * @returns {Promise<VstsUser[]>}
     * @memberOf VstsGraphApiUserService
     */
    public async getAllUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]> {
        return new Promise<VstsUser[]>((resolve, reject) => {
            try {
                const options = this.buildApiRequestOptions(vstsAccountName, accessToken);
                // tslint:disable-next-line:no-any
                request.get(options, (err: any, response: any, data: string) => {
                    const apiResponse: IVstsGraphApiUserResponse = JSON.parse(data);
                    resolve(apiResponse.value);
                });
            } catch (err) {
                let errorMessage = 'Encountered an error while retrieving VSTS users. Error details: ';
                if (err) {
                    errorMessage += err.message;
                }
                reject(new Error(errorMessage));
            }
        });
    }

    /**
     * Builds the request option for the VSTS Graph Users API.
     *
     * @private
     * @param {string} vstsAccountName
     * @param {string} accessToken
     *
     * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
     * or does not match the VSTS account naming standards.
     * @throws {InvalidArgumentException} Will throw an error if the accessToken is null or undefined.
     *
     * @returns {}
     * @memberOf VstsGraphApiUserService
     */
    // tslint:disable-next-line:no-any
    private buildApiRequestOptions(vstsAccountName: string, accessToken: string): any {
        VstsHelpers.validateAccountName(vstsAccountName);
        const auth = VstsHelpers.convertPatToApiHeader(accessToken);
        const url = VstsHelpers.buildGraphApiUsersUrl(vstsAccountName);

        return {
            url: url,
            headers: {
                'Authorization': 'basic ' + auth
            }
        }
    }
}

export = VstsGraphApiUserService;