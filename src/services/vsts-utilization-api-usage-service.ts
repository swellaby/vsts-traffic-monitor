'use strict';

import request = require('request');

import helpers = require('./../helpers');
import IsoDateRange = require('./../models/iso-date-range');
import IVstsUsageService = require('./../interfaces/vsts-usage-service');
import IVstsUsageSummaryApiResponse = require('./../interfaces/vsts-usage-summary-api-response');
import VstsHelpers = require('./../vsts-helpers');
import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Implementation of the @see { @link IVstsUsageService } interface that uses
 * the VSTS Utilization APIs to provide access to Usage related operations.
 *
 * @class VstsUtilizationApiUsageService
 * @implements {IVstsUsageService}
 *
 * @link https://{{account}}.visualstudio.com/_apis/utilization/{{api}}
 */
class VstsUtilizationApiUsageService implements IVstsUsageService {

    /**
     * Retrieves the VSTS usage records for the specified user from the previous day (UTC standard).
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     *
     * @returns {Promise<VstsUsageRecord[]>}
     * @memberof IVstsUsageService
     */
    public getUserActivityFromYesterday(userId: string, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]> {
        try {
            const dateRange = helpers.getYesterdayUtcDateRange();
            return this.getUserActivityInRange(userId, dateRange, vstsAccountName, accessToken);
        } catch (err) {
            const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'from yesterday. Error details: ';
            return Promise.reject(helpers.buildError(baseErrorMessage, err));
        }
    }

    /**
     * Retrieves the VSTS usage records for the specified user on the specified date (UTC standard).
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     * @param {Date} date - The date (UTC) of user activity to retrieve.
     *
     * @returns {Promise<VstsUsageRecord[]>}
     * @memberof IVstsUsageService
     */
    public getUserActivityOnDate(userId: string, date: Date, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]> {
        try {
            const dateRange = helpers.buildUtcIsoDateRange(date);
            return this.getUserActivityInRange(userId, dateRange, vstsAccountName, accessToken);
        } catch (err) {
            const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'on the specified date. Error details: ';
            return Promise.reject(helpers.buildError(baseErrorMessage, err));
        }
    }

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
    public getUserActivityOverLast24Hours(userId: string, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]> {
        try {
            const dateRange = helpers.getLast24HoursUtcDateRange();
            return this.getUserActivityInRange(userId, dateRange, vstsAccountName, accessToken);
        } catch (err) {
            const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'over the last 24 hours. Error details: ';
            return Promise.reject(helpers.buildError(baseErrorMessage, err));
        }
    }

    /**
     * Retrieves the VSTS usage records for the specified user on the specified account.
     *
     * @param {string} userId - The Id of the user in VSTS.
     * @param {string} vstsAccountName - The VSTS account name.
     * @param {string} accessToken - The PAT with access to the specified VSTS account.
     * @param {Date} date - The date (UTC) of user activity to retrieve.
     *
     * @private
     * @memberof VstsUtilizationApiUsageService
     *
     * @returns {Promise<VstsUsageRecord[]>}
     */
    private getUserActivityInRange(userId: string, isoDateRange: IsoDateRange, vstsAccountName: string, accessToken: string)
        : Promise<VstsUsageRecord[]> {
        return new Promise<VstsUsageRecord[]>((resolve, reject) => {
            try {
                const url = VstsHelpers.buildUtilizationUsageSummaryApiUrl(vstsAccountName, userId, isoDateRange);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);

                // tslint:disable-next-line:no-any
                request.get(options, (err: any, response: any, data: string) => {
                    if (!err && response.statusCode === 200) {
                        try {
                            const apiResponse: IVstsUsageSummaryApiResponse = JSON.parse(data);
                            resolve(apiResponse.value);
                        } catch (err) {
                            reject(new Error('Invalid or unexpected JSON response from VSTS API. Unable to determine VSTS User Activity.'));
                        }
                    }
                    reject(new Error('VSTS User Activity API Call Failed.'));
                });
            } catch (err) {
                const errorMessage = 'Unable to retrieve VSTS User Activity. Error details: ';
                reject(helpers.buildError(errorMessage, err));
            }
        });
    }
}

export = VstsUtilizationApiUsageService;