'use strict';

import tl = require('vsts-task-lib/task');

import AuthMechanism = require('./enums/auth-mechanism');
import helpers = require('./helpers');
import IpAddressScanReport = require('./models/ip-address-scan-report');
import IpAddressScanRequest = require('./models/ip-address-scan-request');
import taskLogger = require('./task-logger');
import vstsUsageMonitor = require('./vsts-usage-monitor');
import vstsUsageScanTimePeriod = require('./enums/vsts-usage-scan-time-period');
import VstsUsageRecord = require('./models/vsts-usage-record');
import VstsUserActivityReport = require('./models/vsts-user-activity-report');
import vstsUserOrigin = require('./enums/vsts-user-origin');

const fatalErrorMessage = 'Fatal error encountered. Unable to scan IP Addresses.';
const enableDebuggingMessage = 'Enable debugging to receive more detailed error information.';
let vstsAccountName: string;
let vstsAccessToken: string;
let scanTimePeriod: vstsUsageScanTimePeriod;
let userOrigin: vstsUserOrigin;
let allowedIpRanges: string[];
let includeInternalVstsServices: boolean;
let targetAuthMechanism: AuthMechanism;

/**
 * Initializes the task for execution.
 * @private
 */
const initialize = () => {
    vstsAccountName = tl.getInput('accountName', true);
    vstsAccessToken = tl.getInput('accessToken', true);
    scanTimePeriod = +vstsUsageScanTimePeriod[tl.getInput('timePeriod', true)];
    userOrigin = +vstsUserOrigin[tl.getInput('userOrigin', true)];
    allowedIpRanges = tl.getDelimitedInput('ipRange', '\n', true);
    includeInternalVstsServices = tl.getBoolInput('scanInternalVstsServices', true);
    targetAuthMechanism = +AuthMechanism[tl.getInput('targetAuthMechanism', true)];
};

/**
 * Builds the scan request with the specified parameters.
 * @private
 */
const buildScanRequest = () => {
    const scanRequest = new IpAddressScanRequest();
    scanRequest.vstsAccountName = vstsAccountName;
    scanRequest.vstsAccessToken = vstsAccessToken;
    scanRequest.scanTimePeriod = scanTimePeriod;
    scanRequest.vstsUserOrigin = userOrigin;
    scanRequest.includeInternalVstsServices = includeInternalVstsServices;
    scanRequest.allowedIpRanges = allowedIpRanges;
    scanRequest.targetAuthMechanism = targetAuthMechanism;

    return scanRequest;
};

/**
 * Sets the task result to failed.
 *
 * @param {string} failureMessage - The error message to display with the failure.
 * @private
 */
const failTask = (failureMessage: string) => {
    tl.setResult(tl.TaskResult.Failed, failureMessage);
};

/**
 * Handles task execution when a null or undefined scan report is returned.
 * @private
 */
const handleInvalidScanReport = () => {
    tl.error('An internal error occurred. Unable to complete scan.');
    tl.error(enableDebuggingMessage);
    tl.debug('The ScanReport object returned from the Monitor was null or undefined. This is not supposed to happen :) Please ' +
        'open an issue on GitHub at https://github.com/swellaby/vsts-traffic-monitor/issues.');
    failTask(fatalErrorMessage);
};

/**
 * Handles execution when the scan report shows a fatal error occurred.
 *
 * @param {IpAddressScanReport} scanReport - The report of object with details of the completed scan.
 * @private
 */
const handleUnscannedUserErrors = (scanReport: IpAddressScanReport) => {
    const userRecordRetrievalErrors = scanReport.usageRetrievalErrorMessages;
    userRecordRetrievalErrors.forEach(retreivalError => {
        tl.error(retreivalError);
    });
};

/**
 * Handles any users that were unabled to be scanned.
 *
 * @param {IpAddressScanReport} scanReport - The report of object with details of the completed scan.
 * @private
 */
const handleUnscannedUsers = (scanReport: IpAddressScanReport) => {
    const unscannedUsers = scanReport.usageRetrievalErrorUsers;
    if (unscannedUsers.length > 0) {
        tl.error('Failed to retrieve usage records for ' + unscannedUsers.length + ' user(s).');
        handleUnscannedUserErrors(scanReport);
    }
};

/**
 * Handles execution when the scan report shows a fatal error occurred.
 *
 * @param {IpAddressScanReport} scanReport - The report of object with details of the completed scan.
 * @private
 */
const handleScanError = (scanReport: IpAddressScanReport) => {
    tl.error('An error occurred while attempting to execute the scan. Error details: ' + scanReport.errorMessage);
    tl.error(enableDebuggingMessage);
    tl.debug(scanReport.debugErrorMessage);
    failTask('Failing the task because the scan was not successfully executed.');
};

/**
 * Displays the parameters that were used during the scan.
 * @private
 */
const printScanParameters = () => {
    taskLogger.log('VSTS Account Scanned: ' + vstsAccountName);
    taskLogger.log('Scan Period: ' + vstsUsageScanTimePeriod[scanTimePeriod]);
    taskLogger.log('VSTS User Origin: ' + vstsUserOrigin[userOrigin]);
    if (includeInternalVstsServices) {
        taskLogger.log('Traffic generated from internal VSTS processes was also scanned.');
    } else {
        taskLogger.log('Traffic generated from internal VSTS processes was ignored.');
    }

    taskLogger.log('The allowable IPv4 ranges that were used in this scan: ' + allowedIpRanges);
};

/**
 * Displays information about usage metrics discovered in the scan.
 * @param {IpAddressScanReport} scanReport - The report containing the full scan results.
 * @private
 */
const displayUsageMetrics = (scanReport: IpAddressScanReport) => {
    taskLogger.log('The usage records of: ' + scanReport.numUsersActive + ' user(s) were analyzed.');
    taskLogger.log('A total of: ' + scanReport.totalUsageRecordsScanned + ' usage record(s) were analyzed.');
};

/**
 * Displays information about the flagged usage records.
 *
 * @param {VstsUsageRecord[]} flaggedUsageRecords - The usage records that contain out of range IP addresses.
 * @private
 */
const writeTaskErrorMessageForUsageRecords = (flaggedUsageRecords: VstsUsageRecord[]) => {
    flaggedUsageRecords.forEach(flaggedRecord => {
        const application = flaggedRecord.application;
        const command = flaggedRecord.command;
        const ipAddress = flaggedRecord.ipAddress;
        const startTime = flaggedRecord.startTime;
        const userAgent = flaggedRecord.userAgent;
        const authMechanism = flaggedRecord.authenticationMechanism;
        const recordErrorMessage = 'IP Address: ' + ipAddress + ' Application: ' + application +
            ' Command: ' + command + ' Start: ' + startTime + ' UserAgent: ' + userAgent +
            ' AuthenticationMechanism: ' + authMechanism;

        tl.error(recordErrorMessage);
    });
};

/**
 * Displays information about users whose activity was flagged by the scan.
 *
 * @param {VstsUserActivityReport[]} flaggedUserActivityReports - The reports of user activity that were flagged.
 * @private
 */
const displayFlaggedUserInformation = (flaggedUserActivityReports: VstsUserActivityReport[]) => {
    const numFlaggedUsers = flaggedUserActivityReports.length;
    tl.error(numFlaggedUsers + ' user(s) accessed the VSTS account from an unallowed IP Address that was outside the specified range.');
    flaggedUserActivityReports.forEach(userActivityReport => {
        const user = userActivityReport.user;
        const numFlaggedRecords = userActivityReport.matchedUsageRecords.length;
        const totalUsageRecords = userActivityReport.allUsageRecords.length;
        taskLogger.log('User: ' + user.displayName + ' had: ' + totalUsageRecords + ' total usage record(s) during the scan period.');
        tl.error('User: ' + user.displayName + ' had: ' + numFlaggedRecords + ' usage record(s) from an unallowed IP Address.');
        writeTaskErrorMessageForUsageRecords(userActivityReport.matchedUsageRecords);
    });
};

/**
 * Displays information for users whose activity was not scanned, typically due to errors.
 *
 * @param {VstsUserActivityReport[]} flaggedUserActivityReports - The reports of user activity that were not scanned.
 * @private
 */
const displayUnscannedUserInformation = (unscannedUserActivityReports: VstsUserActivityReport[]) => {
    tl.error('Unable to scan the usage records for: ' + unscannedUserActivityReports.length + ' user(s).');
    tl.error(enableDebuggingMessage);
    unscannedUserActivityReports.forEach(userActivityReport => {
        const user = userActivityReport.user;
        tl.error('Unable to analyze activity for user: ' + user.displayName);
        tl.debug('Error details: ');
        userActivityReport.scanFailureErrorMessages.forEach(errorMessage => {
            tl.debug(errorMessage);
        });
    });
};

/**
 * Reviews the report of scan results to see if any errors were encountered
 * while attempting to scan the usage records of individual users.
 *
 * @param {IpAddressScanReport} scanReport - The report with details of the completed scan.
 * @private
 */
const determineUserScanResult = (scanReport: IpAddressScanReport): boolean => {
    let scanPassed = true;

    if (scanReport.flaggedUserActivityReports.length > 0) {
        scanPassed = false;
        displayFlaggedUserInformation(scanReport.flaggedUserActivityReports);
    }

    if (scanReport.unscannedUserActivityReports.length > 0) {
        scanPassed = false;
        displayUnscannedUserInformation(scanReport.unscannedUserActivityReports);
    }

    return scanPassed;
};

/**
 * Reviews the scan of the report.
 *
 * @param {IpAddressScanReport} scanReport - The report with details of the completed scan.
 * @private
 */
const reviewScanReport = (scanReport: IpAddressScanReport) => {
    printScanParameters();
    if (!scanReport) {
        return handleInvalidScanReport();
    }

    displayUsageMetrics(scanReport);
    handleUnscannedUsers(scanReport);
    const scanPassed = determineUserScanResult(scanReport);

    if (!scanReport.completedSuccessfully) {
       return handleScanError(scanReport);
    }

    if (scanPassed) {
        taskLogger.log('All activity originated from within the specified range(s) of IP Addresses.');
        tl.setResult(tl.TaskResult.Succeeded, null);
    } else {
        failTask('Scan result included matched/invalid records. The user and traffic details are in the output.');
    }
};

/**
 * Entry point for VSTS task execution.
 */
export const run = async () => {
    try {
        initialize();
        const requestParams = buildScanRequest();
        taskLogger.log('Starting the scan. Note that the scan may take a while if you have a large number of users in your VSTS account');
        const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(requestParams);
        reviewScanReport(scanReport);
    } catch (err) {
        printScanParameters();
        tl.error(helpers.buildError('Unexpected fatal execution error: ', err).message);
        failTask(fatalErrorMessage);
    }
};
