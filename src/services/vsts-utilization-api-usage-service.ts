'use strict';

import request = require('request');

import helpers = require('./../helpers');
import IVstsUsageService = require('./../interfaces/vsts-usage-service');
import IVstsUsageSummaryApiResponse = require('./../interfaces/vsts-usage-summary-api-response');
import VstsHelpers = require('./../vsts-helpers');
import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Implementation of the @see { @link IVstsUsageService } interface that uses
 * the VSTS Utilization APIs to provide access to usage related operations.
 *
 * @class VstsUtilizationApiUsageService
 * @implements {IVstsUsageService}
 *
 * @link https://{{account}}.visualstudio.com/_apis/utilization/{{api}}
 */
class VstsUtilizationApiUsageService implements IVstsUsageService {
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
    public getUserActivityOnDate(userId: string, date: Date, vstsAccountName: string, accessToken: string): Promise<VstsUsageRecord[]> {
        return new Promise<VstsUsageRecord[]>((resolve, reject) => {
            try {
                const url = this.buildApiQueryString(vstsAccountName, userId, date);
                const options = VstsHelpers.buildRestApiBasicAuthRequestOptions(url, accessToken);

                // tslint:disable-next-line:no-any
                request.get(options, (err: any, response: any, data: string) => {
                    if (!err && response.statusCode === 200) {
                        try {
                            const apiResponse: IVstsUsageSummaryApiResponse = JSON.parse(data);
                            resolve(apiResponse.value);
                        } catch (err) {
                            reject(new Error('Invalid or unexpected JSON encountered. Unable to determine VSTS User Activity.'));
                        }
                    }
                    reject(new Error('VSTS User Activity API Call Failed.'));
                });
            } catch (err) {
                const errorMessage = 'Encountered an unexpected error while attempting to retrieve VSTS User Activity. Error details: ';
                reject(helpers.buildError(errorMessage, err));
            }
        });
    }

    /**
     *
     * @param vstsAccountName
     * @param userId
     * @param date
     */
    private buildApiQueryString(vstsAccountName: string, userId: string, date: Date): string {
        if (!date) {
            throw new Error();
        }
        const url = VstsHelpers.buildUtilizationUsageSummaryApiUrl(vstsAccountName);
        const targetDate = date.toISOString().split('T')[0];
        const startTimeSuffix = 'T00:00:00.001Z';
        const endTimeSuffix = 'T23:59:59.999Z';
        return url + '?userId=' + userId + '&startTime=' + targetDate + startTimeSuffix + '&endTime=' + targetDate + endTimeSuffix;
    }
}

export = VstsUtilizationApiUsageService;