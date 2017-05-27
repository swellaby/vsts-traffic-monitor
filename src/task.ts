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

/**
 *
 */
const initialize = () => {
    vstsAccountName = tl.getInput('accountName', true);
    pat = tl.getInput('pat', true);
    validIpRange = tl.getDelimitedInput('ipRange', '\n', true);  //= ['76.187.101.174'];
    timePeriod = tl.getInput('timePeriod', true);
    utilizationService = new VstsUtilizationApiUsageService();
    // vstsAccountName = 'swellaby';
    // pat = '';
    // validIpRange = ['76.187.101.175'];
    // timePeriod = 'Yesterday';
}

/**
 *
 * @param usageRecords
 * @param user
 */
const scanRecords = (usageRecords: VstsUsageRecord[], user: VstsUser) => {
    usageRecords.forEach(record => {
        const userName = user.displayName;
        const ipAddress = record.ipAddress;
        if (ipAddress && !ipRangeHelper.inRange(ipAddress, validIpRange)) {
            console.log('LOLIYOYUOSIDFYITGW#RKGJWEFHLSDKUFHSDFHSDF');
            console.log('User: ' + userName + ' made illegal access from IP: ' + ipAddress + ' on around: ' + record.startTime + ' (UTC)');
        }
    });
}

/**
 *
 * @param user
 */
const scanYesterday = async (user: VstsUser): Promise<VstsUsageRecord[]> => {
    try {
        const usageRecords = await utilizationService.getUserActivityFromYesterday(user.id, vstsAccountName, pat);
        scanRecords(usageRecords, user);
        return usageRecords;
    } catch (err) {
        console.log(helpers.buildError('Error while attempting to review: ', err).message);
        return null;
    }
}

/**
 *
 * @param user
 */
const scanLast24Hours = async (user: VstsUser): Promise<VstsUsageRecord[]> => {
    try {
        const usageRecords = await utilizationService.getUserActivityOverLast24Hours(user.id, vstsAccountName, pat);
        scanRecords(usageRecords, user);
        return usageRecords;
    } catch (err) {
        console.log(helpers.buildError('Scan Error: ', err).message);
        return null;
    }
}

/**
 *
 */
export const run = async () => {
    initialize();
    const userService = new VstsGraphApiUserService();
    let users: VstsUser[];

    try {
        users = await userService.getAADUsers(vstsAccountName, pat);
        if (timePeriod === 'Yesterday') {
            users.forEach(async user => { await scanYesterday(user); });
        } else {
            users.forEach(async user => { await scanLast24Hours(user); });
        }
    } catch (err) {
        console.log(helpers.buildError('Run error', err).message);
    }
};

run();