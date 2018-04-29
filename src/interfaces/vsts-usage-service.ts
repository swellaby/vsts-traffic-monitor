'use strict';

import VstsUsageRecord = require('./../models/vsts-usage-record');
import VstsUser = require('./../models/vsts-user');

/**
 * Describes the capabilities of a service that facilitates
 * interactions with usage data in VSTS.
 *
 * @interface IVstsUsageService
 */
interface IVstsUsageService {
    /**
     * Retrieves the usage records from the specified VSTS account for the specified user from the previous day (UTC standard).
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     *
     * @returns {Promise<VstsUsageRecord[]>}
     * @memberof IVstsUsageService
     */
    getUserActivityFromYesterday(userId: string, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]>;

    /**
     * Retrieves the VSTS usage records for the specified user on the specified account.
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     * @param {Date} date - The date (UTC) of user activity to retrieve.
     *
     * @returns {Promise<VstsUsageRecord[]>}
     * @memberof IVstsUsageService
     */
    getUserActivityOnDate(userId: string, date: Date, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]>;

    /**
     * Retrieves the VSTS usage records for the specified user over the past 24 hours (UTC standard).
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     *
     * @returns {Promise<VstsUsageRecord[]>}
     * @memberof IVstsUsageService
     */
    getUserActivityOverLast24Hours(userId: string, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]>;

    /**
     * Returns the set of users that accessed the specified VSTS account within the last 24 hours.
     *
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     *
     * @returns {Promise<VstsUser[]>}
     * @memberof IVstsUsageService
     */
    getActiveUsersFromLast24Hours(vstsAccountName: string, accessToken: string): Promise<VstsUser[]>;

    /**
     * Returns the set of users that accessed the specified VSTS account during the prior day.
     *
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     *
     * @returns {Promise<VstsUser[]>}
     * @memberof IVstsUsageService
     */
    getActiveUsersFromYesterday(vstsAccountName: string, accessToken: string): Promise<VstsUser[]>;
}

export = IVstsUsageService;