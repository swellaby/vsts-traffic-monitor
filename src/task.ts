'use strict';

import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

import helpers = require('./helpers');
import IpAddressScanReport = require('./models/ip-address-scan-report');
import IpAddressScanRequest = require('./models/ip-address-scan-request');
import vstsUsageMonitor = require('./vsts-usage-monitor');
import vstsUsageScanTimePeriod = require('./enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./enums/vsts-user-origin');

let echo: trm.ToolRunner;
const fatalErrorMessage = 'Fatal error encountered. Unable to scan IP Addresses';
const enableDebuggingMessage = 'Enable debugging to receive more detailed error information';
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
    echo = tl.tool(tl.which('echo'));
}

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
    scanRequest.allowedIpRanges = allowedIpRanges

    return scanRequest;
};

/**
 * Sets the task result to failed.
 * @param {string} failureMessage - The error message to display with the failure.
 * @private
 */
const failTask = (failureMessage: string) => {
    tl.setResult(tl.TaskResult.Failed, failureMessage);
}

/**
 * Handles task execution when a null or undefined scan report is returned.
 */
const handleInvalidScanReport = () => {
    tl.error('An internal error occurred. Unable to complete scan.');
    tl.error(enableDebuggingMessage);
    tl.debug('The ScanReport object returned from the Monitor was null or undefined. This is not supposed to happen :) Please ' +
        'open an issue on GitHub at https://github.com/swellaby/vsts-traffic-monitor/issues');
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
    failTask('Failing the task because the scan was not successfully executed');
};

/**
 * Displays the parameters that were used during the scan.
 * @private
 */
const printScanParameters = () => {
    echo.arg('VSTS Account Scanned: ' + vstsAccountName);
    echo.arg('Scan Period: ' + scanTimePeriod.toString());
    echo.arg('VSTS User Origin: ' + userOrigin.toString());
    if (includeInternalVstsServices) {
        echo.arg('Traffic generated from internal VSTS processes was also scanned');
    } else {
        echo.arg('Traffic generated from internal VSTS processes was ignored');
    }
    echo.arg('The allowable IPv4 ranges that were used in this scan: ' + allowedIpRanges);
};

// eslint-disable-next-line no-unused-vars
const displayUsageMetrics = (scanReport: IpAddressScanReport) => {
    echo.arg('There were: ' + scanReport.numUsersActive + ' users from the specified user origin that were active during the specified period');
};

/**
 * Reviews the report of scan results to see if any errors were encountered
 * while attempting to scan the usage records of individual users.
 * @param {IpAddressScanReport} scanReport - The report with details of the completed scan.
 */
// eslint-disable-next-line no-unused-vars
const checkForIndividualUserScanErrors = (scanReport: IpAddressScanReport) => {
    // scanReport.
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

    if (scanReport.numOutOfRangeIpAddressRecords > 0) {
        tl.setResult(tl.TaskResult.Failed, 'Invalid records found. The user and traffic details are in the output.');
    } else {
        tl.setResult(tl.TaskResult.Succeeded, 'All activity originated from within the specified range(s) of IP Addresses.');
    }
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