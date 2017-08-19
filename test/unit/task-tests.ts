'use strict';

import Chai = require('chai');
import Sinon = require('sinon');
// Doing this prior to importing the core task lib to avoid loading/writing unnecessary content.
import internal = require('vsts-task-lib/internal');
Sinon.stub(internal, '_loadData').callsFake(() => null);
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

import helpers = require('./../../src/helpers');
import IpAddressScanReport = require('./../../src/models/ip-address-scan-report');
import IpAddressScanRequest = require('./../../src/models/ip-address-scan-request');
import task = require('./../../src/task');
import testHelpers = require('./test-helpers');
import vstsUsageMonitor = require('./../../src/vsts-usage-monitor');
import vstsUsageScanTimePeriod = require('./../../src/enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/task.ts}
 */
// eslint-disable-next-line max-statements
suite('Task Suite:', () => {
    const sandbox = Sinon.sandbox.create();
    let vstsUsageMonitorScanForOutOfRangeIpAddressesStub: Sinon.SinonStub;
    let tlGetInputStub: Sinon.SinonStub;
    let tlGetDelimitedInputStub: Sinon.SinonStub;
    let tlGetBoolInput: Sinon.SinonStub;
    let tlErrorStub: Sinon.SinonStub;
    let tlDebugStub: Sinon.SinonStub;
    let tlSetResultStub: Sinon.SinonStub;
    let tlWhichStub: Sinon.SinonStub;
    let tlToolStub: Sinon.SinonStub;
    let helpersBuildErrorStub: Sinon.SinonStub;
    const echo = { arg: () => { return; } };
    let echoArgStub: Sinon.SinonStub;
    let scanReport: IpAddressScanReport;
    const accountName = testHelpers.vstsAccountName;
    const allowedRanges = testHelpers.allowedIpRanges;
    const scanPeriod = vstsUsageScanTimePeriod.priorDay;
    const userOrigin = vstsUserOrigin.aad;
    const scanPeriodStr = 'priorDay';
    const userOriginStr = 'aad';
    const accountNameKey = 'accountName';
    const accessTokenKey = 'accessToken';
    const sampleToken = 'abcdefghijklmnopqrstuvwxyz';
    const timePeriodKey = 'timePeriod';
    const userOriginKey = 'userOrigin';
    const includeInternalVstsServicesKey = 'scanInternalVstsServices';
    const echoPath = '/bin/echo';
    const buildErrorMessage = 'fail error crash';
    const buildErrorMessageBase = 'Unexpected fatal execution error: ';
    const fatalErrorMessage = 'Fatal error encountered. Unable to scan IP Addresses.';
    const vstsAccountParamDisplayMessageBase = 'VSTS Account Scanned: ';
    const scanPeriodParamDisplayMessageBase = 'Scan Period: ';
    const userOriginParamDisplayMessageBase = 'VSTS User Origin: ';
    const includeInternalVstsDisplayMessage = 'Traffic generated from internal VSTS processes was also scanned.';
    const excludeInternalVstsDisplayMessage = 'Traffic generated from internal VSTS processes was ignored.';
    const allowedIpRangesParamDisplayMessageBase = 'The allowable IPv4 ranges that were used in this scan: ';
    const enableDebuggingMessage = 'Enable debugging to receive more detailed error information.';
    const invalidScanReportErrorMessage = 'An internal error occurred. Unable to complete scan.';
    const invalidScanReportDebugMessage = 'The ScanReport object returned from the Monitor was null or undefined. ' +
        'This is not supposed to happen :) Please open an issue on GitHub at https://github.com/swellaby/vsts-traffic-monitor/issues.';
    const scanFailureErrorMessageBase = 'An error occurred while attempting to execute the scan. Error details: ';
    const scanFailureTaskFailureMessage = 'Failing the task because the scan was not successfully executed.';
    // eslint-disable-next-line no-unused-vars
    // let internalLoadDataStub: Sinon.SinonStub;

    /**
     * Helper function for initializing stubs.
     */
    const setupInputStubs = () => {
        tlGetInputStub = sandbox.stub(tl, 'getInput');
        tlGetInputStub.withArgs(accountNameKey, true).callsFake(() => accountName);
        tlGetInputStub.withArgs(accessTokenKey, true).callsFake(() => sampleToken);
        tlGetInputStub.withArgs(timePeriodKey, true).callsFake(() => scanPeriodStr);
        tlGetInputStub.withArgs(userOriginKey, true).callsFake(() => userOriginStr);
        tlGetDelimitedInputStub = sandbox.stub(tl, 'getDelimitedInput').callsFake(() => {
            return allowedRanges;
        });
        tlGetBoolInput = sandbox.stub(tl, 'getBoolInput');
        tlGetBoolInput.withArgs(includeInternalVstsServicesKey, true).callsFake(() => false);
    };

    // eslint-disable-next-line max-statements
    setup(() => {
        // internalLoadDataStub = sandbox.stub(internal, '_loadData').callsFake(() => null);
        tlErrorStub = sandbox.stub(tl, 'error').callsFake(() => null);
        tlDebugStub = sandbox.stub(tl, 'debug').callsFake(() => null);
        process.env.VSTS_TASKVARIABLE_ = '';
        setupInputStubs();
        scanReport = new IpAddressScanReport();
        vstsUsageMonitorScanForOutOfRangeIpAddressesStub = sandbox.stub(vstsUsageMonitor, 'scanForOutOfRangeIpAddresses').callsFake(() => {
            return scanReport;
        });
        tlSetResultStub = sandbox.stub(tl, 'setResult').callsFake(() => null);
        tlWhichStub = sandbox.stub(tl, 'which').callsFake(() => { return echoPath; });
        echoArgStub = sandbox.stub(echo, 'arg').callsFake(() => { return; });
        tlToolStub = sandbox.stub(tl, 'tool').callsFake(() => { return echo; });
        helpersBuildErrorStub = sandbox.stub(helpers, 'buildError').callsFake(() => {
            return new Error(buildErrorMessage);
        });
    });

    teardown(() => {
        scanReport = null;
        sandbox.restore();
    });

    // eslint-disable-next-line max-statements
    suite('scan error Suite:', () => {
        test('Should correctly initialize parameters', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(tlGetInputStub.calledWith(accountNameKey, true));
            assert.isTrue(tlGetInputStub.calledWith(accessTokenKey, true));
            assert.isTrue(tlGetInputStub.calledWith(timePeriodKey, true));
            assert.isTrue(tlGetInputStub.calledWith(userOriginKey, true));
            assert.isTrue(tlGetDelimitedInputStub.calledWith('ipRange', '\n', true));
            assert.isTrue(tlGetBoolInput.calledWith(includeInternalVstsServicesKey, true));
            assert.isTrue(tlWhichStub.calledWith('echo'));
            assert.isTrue(tlToolStub.calledWith(echoPath));
        });

        test('Should handle fatal scan error correctly', async () => {
            const errMessage = 'oh no!';
            const error = new Error(errMessage);
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw error; });
            await task.run();
            assert.isTrue(helpersBuildErrorStub.calledWith(buildErrorMessageBase, error));
            assert.isTrue(tlErrorStub.calledWith(buildErrorMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, fatalErrorMessage));
        });

        test('Should still print scan parameters when fatal error occurs', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(echoArgStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(echoArgStub.calledWith(scanPeriodParamDisplayMessageBase + scanPeriod.toString()));
            assert.isTrue(echoArgStub.calledWith(userOriginParamDisplayMessageBase + userOrigin.toString()));
            assert.isTrue(echoArgStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
        });

        test('Should display correct error message when internal VSTS traffic is excluded', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(echoArgStub.calledWith(excludeInternalVstsDisplayMessage));
        });

        test('Should display correct error message when internal VSTS traffic is included', async () => {
            tlGetBoolInput.withArgs(includeInternalVstsServicesKey, true).callsFake(() => true);
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(echoArgStub.calledWith(includeInternalVstsDisplayMessage));
        });

        test('Should correctly handle when undefined scan report is returned', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => undefined);
            await task.run();
            assert.isTrue(echoArgStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(echoArgStub.calledWith(scanPeriodParamDisplayMessageBase + scanPeriod.toString()));
            assert.isTrue(echoArgStub.calledWith(userOriginParamDisplayMessageBase + userOrigin.toString()));
            assert.isTrue(echoArgStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
            assert.isTrue(tlErrorStub.calledWith(invalidScanReportErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlDebugStub.calledWith(invalidScanReportDebugMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, fatalErrorMessage));
        });

        test('Should correctly handle when null scan report is returned', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => null);
            await task.run();
            assert.isTrue(echoArgStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(echoArgStub.calledWith(scanPeriodParamDisplayMessageBase + scanPeriod.toString()));
            assert.isTrue(echoArgStub.calledWith(userOriginParamDisplayMessageBase + userOrigin.toString()));
            assert.isTrue(echoArgStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
            assert.isTrue(tlErrorStub.calledWith(invalidScanReportErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlDebugStub.calledWith(invalidScanReportDebugMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, fatalErrorMessage));
        });

        test('Should correctly handle scan report with a failed status', async () => {
            const scanErrorMessage = 'wrecked';
            const scanDebugErrorMessage = 'Graph API call failed';
            scanReport.completedSuccessfully = false;
            scanReport.errorMessage = scanErrorMessage;
            scanReport.debugErrorMessage = scanDebugErrorMessage;
            await task.run();
            assert.isTrue(tlErrorStub.calledWith(scanFailureErrorMessageBase + scanErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlDebugStub.calledWith(scanDebugErrorMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, scanFailureTaskFailureMessage));
        });
    });

    // eslint-disable-next-line max-statements
    suite('scanCompletedSuccessfully Suite:', () => {
        const failedTaskErrorMessage = 'Scan result included matched/invalid records. The user and traffic details are in the output.';
        const displayUserCountMessagePrefix = 'There were: ';
        const displayUserCountMessageSuffix = ' users from the specified user origin that were active during the specified period.';
        const displayNumRecordsScannedPrefix = 'A total of: ';
        const displayNumRecordsScannedSuffix = ' usage records were analyzed.';
        const taskSuccededMessage = 'All activity originated from within the specified range(s) of IP Addresses.';
        const flaggedUsersErrorMessageSuffix = ' users accessed the VSTS account from an unallowed IP Address that was outside the specified range.';
        const flaggedUserRecordsErrorMessagePrefix = 'User: ';
        const flaggedUserRecordsErrorMessageMiddle = ' had: ';
        const flaggedUserTotalRecordsErrorMessageSuffix = ' total usage entries during the scan period.';
        const flaggedUserMatchedRecordsErrorMessageSuffix = ' usage entries from an unallowed IP Address.';
        const normDisplayName = 'norm';
        const baileyDisplayName = 'bailey';
        const normTotalRecordsErrorMessage = flaggedUserRecordsErrorMessagePrefix + normDisplayName +
            flaggedUserRecordsErrorMessageMiddle + 2 + flaggedUserTotalRecordsErrorMessageSuffix;
        const normFlaggedRecordsErrorMessage = flaggedUserRecordsErrorMessagePrefix + normDisplayName +
            flaggedUserRecordsErrorMessageMiddle + 1 + flaggedUserMatchedRecordsErrorMessageSuffix;
        const baileyTotalRecordsErrorMessage = flaggedUserRecordsErrorMessagePrefix + baileyDisplayName +
            flaggedUserRecordsErrorMessageMiddle + 2 + flaggedUserTotalRecordsErrorMessageSuffix;
        const baileyFlaggedRecordsErrorMessage = flaggedUserRecordsErrorMessagePrefix + baileyDisplayName +
            flaggedUserRecordsErrorMessageMiddle + 1 + flaggedUserMatchedRecordsErrorMessageSuffix;
        const recordDetailIpAddressMessage = 'IP Address: ';
        const recordDetailApplicationMessage = ' Application: ';
        const recordDetailCommandMessage = ' Command: ';
        const recordDetailStartMessage = ' Start: ';
        const recordDetailEndMessage = ' End: ';
        const recordDetailUserAgentMessage = ' UserAgent: ';
        const firstFlaggedUsageRecord = testHelpers.firstUsageRecord;
        const firstRecordDetailsMessage = recordDetailIpAddressMessage + firstFlaggedUsageRecord.ipAddress + recordDetailApplicationMessage +
            firstFlaggedUsageRecord.application + recordDetailCommandMessage + firstFlaggedUsageRecord.command + recordDetailStartMessage +
            firstFlaggedUsageRecord.startTime + recordDetailEndMessage + firstFlaggedUsageRecord.endTime + recordDetailUserAgentMessage +
            firstFlaggedUsageRecord.userAgent;
        const secondFlaggedUsageRecord = testHelpers.secondUsageRecord;
        const secondRecordDetailsMessage = recordDetailIpAddressMessage + secondFlaggedUsageRecord.ipAddress + recordDetailApplicationMessage +
            secondFlaggedUsageRecord.application + recordDetailCommandMessage + secondFlaggedUsageRecord.command + recordDetailStartMessage +
            secondFlaggedUsageRecord.startTime + recordDetailEndMessage + secondFlaggedUsageRecord.endTime + recordDetailUserAgentMessage +
            secondFlaggedUsageRecord.userAgent;

        /**
         * Helper function to configure the scanReport object with flagged user records.
         */
        const addUnscannedUserRecordsToScanReport = () => {
            scanReport.unscannedUserActivityReports.push(testHelpers.unscannedUserActivityReport);
        };

        /**
         * Helper function to clear flagged user scan reports.
         */
        const removeFlaggedUserRecordsFromScanReport = () => {
            scanReport.numUsersWithFlaggedRecords = 0;
            scanReport.flaggedUserActivityReports = [];
        };

        setup(() => {
            scanReport.completedSuccessfully = true;
            scanReport.numUsersActive = 3;
            scanReport.totalUsageRecordsScanned = 128;
            scanReport.numUsersWithFlaggedRecords = 2;
            scanReport.userActivityReports.push(testHelpers.firstUserActivityReport);
            scanReport.userActivityReports.push.apply(scanReport.userActivityReports, testHelpers.flaggedUserActivityReports);
            scanReport.flaggedUserActivityReports.push.apply(scanReport.flaggedUserActivityReports, testHelpers.flaggedUserActivityReports);
        });

        test('Should display correct usage details when the report contains flagged activity', async () => {
            await task.run();
            assert.deepEqual(scanReport.numUsersWithFlaggedRecords, 2);
            assert.isTrue(tlErrorStub.calledWith(2 + flaggedUsersErrorMessageSuffix));
            assert.isTrue(echoArgStub.calledWith(normTotalRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(normFlaggedRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(secondRecordDetailsMessage));
            assert.isTrue(echoArgStub.calledWith(baileyTotalRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(baileyFlaggedRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(firstRecordDetailsMessage));
        });

        test('Should display correct usage details when the report contains unscanned activity', async () => {
            addUnscannedUserRecordsToScanReport();
            await task.run();
            assert.deepEqual(scanReport.unscannedUserActivityReports.length, 1);
            assert.isTrue(tlErrorStub.calledWith('Unable to scan the usage records for: 1 user(s).'));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlErrorStub.calledWith('Unable to analyze activity for user: caleb'));
            assert.isTrue(tlDebugStub.calledWith('Error details: '));
            assert.isTrue(tlDebugStub.calledWith('woops'));
            assert.isTrue(tlDebugStub.calledWith('ouch'));
        });

        test('Should fail the task when there are flagged records but no failed scan records', async () => {
            await task.run();
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should fail the task when there are flagged records and failed scan records', async () => {
            await task.run();
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should fail the task when there are no flagged records but are unscanned scan records', async () => {
            removeFlaggedUserRecordsFromScanReport();
            addUnscannedUserRecordsToScanReport();
            await task.run();
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should display usage metrics when scan completes successfully', async () => {
            removeFlaggedUserRecordsFromScanReport();
            await task.run();
            assert.isTrue(echoArgStub.calledWith(displayUserCountMessagePrefix + 3 + displayUserCountMessageSuffix));
            assert.isTrue(echoArgStub.calledWith(displayNumRecordsScannedPrefix + 128 + displayNumRecordsScannedSuffix));
        });

        test('Should set the final task result to succeeded when there are no flagged nor failed user scan results', async () => {
            removeFlaggedUserRecordsFromScanReport();
            await task.run();
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Succeeded, taskSuccededMessage));
        });
    });
});