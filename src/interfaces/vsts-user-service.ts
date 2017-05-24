'use strict';

import VstsUser = require('./../models/vsts-user');

/**
 * Describes the cabalities of a service that provides
 * access to user information on a VSTS Account.
 *
 * @interface IVstsUserService
 */
interface IVstsUserService {
    /**
     * Retrieves all users from a VSTS account that are sourced from
     * an Azure Active Directory (AAD) Tenant.
     *
     * @param {string} vstsAccountName
     * @param {string} accessToken
     * @returns {Promise<VstsUser[]>}
     *
     * @memberOf IVstsUserService
     */
    getAADUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]>;

    /**
     * Retrieves all users from a VSTS account.
     *
     * @param {string} vstsAccountName
     * @param {string} accessToken
     * @returns {Promise<VstsUser[]>}
     *
     * @memberOf IVstsUserService
     */
    getAllUsers(vstsAccountName: string, accessToken: string): Promise<VstsUser[]>;
}

export = IVstsUserService;