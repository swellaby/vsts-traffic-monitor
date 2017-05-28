'use strict';

import tl = require('vsts-task-lib/task');
import helpers = require('./helpers');
import VstsGraphApiUserService = require('./services/vsts-graph-api-user-service');
import VstsUsageRecord = require('./models/vsts-usage-record');
import VstsUser = require('./models/vsts-user');
import VstsUtilizationApiUsageService = require('./services/vsts-utilization-api-usage-service');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.

let vstsAccountName: string;
let pat: string;
let validIpRange: string[];
let timePeriod: string;
let utilizationService: VstsUtilizationApiUsageService;
let containsFlaggedRecords = false;

/**
 * Performs task setup operations.
 */
const initialize = () => {
    vstsAccountName = tl.getInput('accountName', true);
    pat = tl.getInput('accessToken', true);
    validIpRange = tl.getDelimitedInput('ipRange', '\n', true);
    timePeriod = tl.getInput('timePeriod', true);
    utilizationService = new VstsUtilizationApiUsageService();
};

/**
 * Reviews each of the activity records and checks the origin IP of the request
 * against the specified ranges/blocks of valid IP address.
 *
 * @param {VstsUsageRecord[]} usageRecords - The activity records of the user.
 * @param {VstsUser} user - The VSTS user
 * @private
 */
const scanRecords = (usageRecords: VstsUsageRecord[], user: VstsUser) => {
    usageRecords.forEach(record => {
        const userName = user.displayName;
        const ipAddress = record.ipAddress;
        if (ipAddress && !ipRangeHelper.inRange(ipAddress, validIpRange)) {
            if (record.userAgent.indexOf('VSServices') !== 0) {
                containsFlaggedRecords = true;
                tl.error('******************************************************************************************************************');
                tl.error('User: ' + userName + ' - made illegal access from IP: ' + ipAddress + ' on around: ' + record.startTime + ' (UTC)');
            }
        }
    });
};

/**
 * Scans the previous day's activity for the specified user.
 *
 * @param {VstsUser} user - The VSTS user
 * @private
 *
 * @returns {Promise<VstsUsageRecord[]>}
 */
const scanYesterday = async (user: VstsUser): Promise<VstsUsageRecord[]> => {
    try {
        const usageRecords = await utilizationService.getUserActivityFromYesterday(user.id, vstsAccountName, pat);
        scanRecords(usageRecords, user);
        return usageRecords;
    } catch (err) {
        tl.error(helpers.buildError('Error while attempting to review yesterday\'s activity records: ', err).message);
        return null;
    }
};

/**
 * Scans the latest 24 hours of activity for the specified user.
 *
 * @param {VstsUser} user - The VSTS user
 * @private
 *
 * @returns {Promise<VstsUsageRecord[]>}
 */
const scanLast24Hours = async (user: VstsUser): Promise<VstsUsageRecord[]> => {
    try {
        const usageRecords = await utilizationService.getUserActivityOverLast24Hours(user.id, vstsAccountName, pat);
        scanRecords(usageRecords, user);
        return usageRecords;
    } catch (err) {
        console.log(helpers.buildError('Error while attempting to review latest activity records: ', err).message);
        return null;
    }
};

/**
 * Sets the final result of the task and exits.
 * @private
 */
const setTaskResult = () => {
    if (containsFlaggedRecords) {
        tl.setResult(tl.TaskResult.Failed, 'Invalid records found. The user and traffic details are in the output.');
    } else {
        tl.setResult(tl.TaskResult.Succeeded, 'All activity originated from within the specified range(s) of IP Addresses.');
    }
};

/**
 * Sets up an array of promises, each of which scans the activity for each respective user.
 *
 * @param {VstsUser[]} users - The users of the VSTS account.
 * @private
 *
 * @returns {Promise<VstsUsageRecord[]>[]}
 */
const createTrafficScanPromises = (users: VstsUser[]): Promise<VstsUsageRecord[]>[] => {
    if (timePeriod === 'yesterday') {
        return users.map(async user => { return await scanYesterday(user); });
    } else {
        return users.map(async user => { return await scanLast24Hours(user); });
    }
}

/**
 * Entry point for VSTS task execution.
 */
export const run = async () => {
    initialize();

    try {
        const userService = new VstsGraphApiUserService();
        const users: VstsUser[] = await userService.getAADUsers(vstsAccountName, pat);
        await Promise.all(createTrafficScanPromises(users));
        setTaskResult();
    } catch (err) {
        tl.error(helpers.buildError('Run error: ', err).message);
        tl.setResult(tl.TaskResult.Failed, 'Error encountered.');
    }
};

run();