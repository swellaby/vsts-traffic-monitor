'use strict';

import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

import helpers = require('./helpers');
import IpAddressScanReport = require('./models/ip-address-scan-report');
import IpAddressScanRequest = require('./models/ip-address-scan-request');
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
};

/**
 * Provides an instance of the tool runner for Echo
 */
const getEchoToolRunner = (): trm.ToolRunner => {
    const echo = tl.tool(tl.which('echo'));
    echo.arg('-e');
    return echo;
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
const handleScanFailure = (scanReport: IpAddressScanReport) => {
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
    const echo = getEchoToolRunner();
    echo.arg('VSTS Account Scanned: ' + vstsAccountName + '\\n');
    echo.arg('Scan Period: ' + vstsUsageScanTimePeriod[scanTimePeriod] + '\\n');
    echo.arg('VSTS User Origin: ' + vstsUserOrigin[userOrigin] + '\\n');
    if (includeInternalVstsServices) {
        echo.arg('Traffic generated from internal VSTS processes was also scanned.\\n');
    } else {
        echo.arg('Traffic generated from internal VSTS processes was ignored.\\n');
    }
    echo.arg('The allowable IPv4 ranges that were used in this scan: ' + allowedIpRanges + '\\n');
    echo.execSync();
};

/**
 * Displays information about usage metrics discovered in the scan.
 * @param {IpAddressScanReport} scanReport - The report containing the full scan results.
 * @private
 */
const displayUsageMetrics = (scanReport: IpAddressScanReport) => {
    const echo = getEchoToolRunner();
    echo.arg('There were: ' + scanReport.numUsersActive + ' users from the specified user origin that were active during the specified period.\\n');
    echo.arg('A total of: ' + scanReport.totalUsageRecordsScanned + ' usage records were analyzed.\\n');
    echo.execSync();
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
        const endTime = flaggedRecord.endTime;
        const userAgent = flaggedRecord.userAgent;
        const recordErrorMessage = 'IP Address: ' + ipAddress + ' Application: ' + application +
            ' Command: ' + command + ' Start: ' + startTime + ' End: ' + endTime + ' UserAgent: ' + userAgent;
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
        const echo = getEchoToolRunner();
        echo.arg('User: ' + user.displayName + ' had: ' + totalUsageRecords + ' total usage entries during the scan period.\\n').execSync();
        tl.error('User: ' + user.displayName + ' had: ' + numFlaggedRecords + ' usage entries from an unallowed IP Address.');
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
const reviewUserScanResults = (scanReport: IpAddressScanReport) => {
    let scanPassed = true;

    if (scanReport.flaggedUserActivityReports.length > 0) {
        scanPassed = false;
        displayFlaggedUserInformation(scanReport.flaggedUserActivityReports);
    }

    if (scanReport.unscannedUserActivityReports.length > 0) {
        scanPassed = false;
        displayUnscannedUserInformation(scanReport.unscannedUserActivityReports);
    }

    if (scanPassed) {
        tl.setResult(tl.TaskResult.Succeeded, 'All activity originated from within the specified range(s) of IP Addresses.');
    } else {
        failTask('Scan result included matched/invalid records. The user and traffic details are in the output.');
    }
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

    if (!scanReport.completedSuccessfully) {
        return handleScanFailure(scanReport);
    }

    displayUsageMetrics(scanReport);
    reviewUserScanResults(scanReport);
};

/**
 * Entry point for VSTS task execution.
 */
export const run = async () => {
    try {
        initialize();
        const requestParams = buildScanRequest();
        const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(requestParams);
        reviewScanReport(scanReport);
    } catch (err) {
        printScanParameters();
        tl.error(helpers.buildError('Unexpected fatal execution error: ', err).message);
        failTask(fatalErrorMessage);
    }
};