'use strict';

import Chai = require('chai');
import Sinon = require('sinon');
// Doing this prior to importing the core task lib to avoid loading/writing unnecessary content.
import internal = require('vsts-task-lib/internal');
Sinon.stub(internal, '_loadData').callsFake(() => null);
import tl = require('vsts-task-lib/task');

import helpers = require('./../../src/helpers');
import IpAddressScanReport = require('./../../src/models/ip-address-scan-report');
import IpAddressScanRequest = require('./../../src/models/ip-address-scan-request');
import task = require('./../../src/task');
import taskLogger = require('./../../src/task-logger');
import testHelpers = require('./test-helpers');
import vstsUsageMonitor = require('./../../src/vsts-usage-monitor');
import vstsUsageScanTimePeriod = require('./../../src/enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/task.ts}
 */
suite('Task Suite:', () => {
    const sandbox = Sinon.sandbox.create();
    let vstsUsageMonitorScanForOutOfRangeIpAddressesStub: Sinon.SinonStub;
    let tlGetInputStub: Sinon.SinonStub;
    let tlGetDelimitedInputStub: Sinon.SinonStub;
    let tlGetBoolInput: Sinon.SinonStub;
    let tlErrorStub: Sinon.SinonStub;
    let tlDebugStub: Sinon.SinonStub;
    let tlSetResultStub: Sinon.SinonStub;
    let helpersBuildErrorStub: Sinon.SinonStub;
    let taskLoggerLogStub: Sinon.SinonStub;
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
    const scanStartedInfoMessage = 'Starting the scan. Note that the scan may take a while if you have a large number of users in your VSTS account';
    const failedTaskErrorMessage = 'Scan result included matched/invalid records. The user and traffic details are in the output.';
    const displayUserCountMessagePrefix = 'The usage records of: ';
    const displayUserCountMessageSuffix = ' user(s) were analyzed.';
    const displayNumRecordsScannedPrefix = 'A total of: ';
    const displayNumRecordsScannedSuffix = ' usage record(s) were analyzed.';
    const zeroUsersScannedDisplayMessage = displayUserCountMessagePrefix + '0' + displayUserCountMessageSuffix;
    const zeroUsageRecordsScannedDisplayMessage = displayNumRecordsScannedPrefix + '0' + displayNumRecordsScannedSuffix;

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

    setup(() => {
        tlErrorStub = sandbox.stub(tl, 'error').callsFake(() => null);
        tlDebugStub = sandbox.stub(tl, 'debug').callsFake(() => null);
        setupInputStubs();
        scanReport = new IpAddressScanReport();
        vstsUsageMonitorScanForOutOfRangeIpAddressesStub = sandbox.stub(vstsUsageMonitor, 'scanForOutOfRangeIpAddresses').callsFake(() => {
            return scanReport;
        });
        tlSetResultStub = sandbox.stub(tl, 'setResult').callsFake(() => null);
        taskLoggerLogStub = sandbox.stub(taskLogger, 'log').callsFake(() => null);
        helpersBuildErrorStub = sandbox.stub(helpers, 'buildError').callsFake(() => {
            return new Error(buildErrorMessage);
        });
    });

    teardown(() => {
        scanReport = null;
        sandbox.restore();
    });

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
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
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
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(taskLoggerLogStub.calledWith(scanPeriodParamDisplayMessageBase + vstsUsageScanTimePeriod[scanPeriod]));
            assert.isTrue(taskLoggerLogStub.calledWith(userOriginParamDisplayMessageBase + vstsUserOrigin[userOrigin]));
            assert.isTrue(taskLoggerLogStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
        });

        test('Should display correct error message when internal VSTS traffic is excluded', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(excludeInternalVstsDisplayMessage));
        });

        test('Should display correct error message when internal VSTS traffic is included', async () => {
            tlGetBoolInput.withArgs(includeInternalVstsServicesKey, true).callsFake(() => true);
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => { throw new Error(); });
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(includeInternalVstsDisplayMessage));
        });

        test('Should correctly handle when undefined scan report is returned', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => undefined);
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(taskLoggerLogStub.calledWith(scanPeriodParamDisplayMessageBase + vstsUsageScanTimePeriod[scanPeriod]));
            assert.isTrue(taskLoggerLogStub.calledWith(userOriginParamDisplayMessageBase + vstsUserOrigin[userOrigin]));
            assert.isTrue(taskLoggerLogStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
            assert.isTrue(tlErrorStub.calledWith(invalidScanReportErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlDebugStub.calledWith(invalidScanReportDebugMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, fatalErrorMessage));
        });

        test('Should correctly handle when null scan report is returned', async () => {
            vstsUsageMonitorScanForOutOfRangeIpAddressesStub.callsFake(() => null);
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(vstsAccountParamDisplayMessageBase + accountName));
            assert.isTrue(taskLoggerLogStub.calledWith(scanPeriodParamDisplayMessageBase + vstsUsageScanTimePeriod[scanPeriod]));
            assert.isTrue(taskLoggerLogStub.calledWith(userOriginParamDisplayMessageBase + vstsUserOrigin[userOrigin]));
            assert.isTrue(taskLoggerLogStub.calledWith(allowedIpRangesParamDisplayMessageBase + allowedRanges));
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
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(tlErrorStub.calledWith(scanFailureErrorMessageBase + scanErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlDebugStub.calledWith(scanDebugErrorMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, scanFailureTaskFailureMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(zeroUsersScannedDisplayMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(zeroUsageRecordsScannedDisplayMessage));
        });

        test('Should correctly handle usage retrieval errors', async () => {
            scanReport.completedSuccessfully = false;
            const retrievalErrorMessage = 'crashed';
            scanReport.usageRetrievalErrorMessages.push(retrievalErrorMessage);
            const unscannedUser = testHelpers.allVstsOriginUsers[0];
            const errorMessage = 'Failed to retrieve usage records for 1 user(s).';
            scanReport.usageRetrievalErrorUsers.push(unscannedUser);
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(tlErrorStub.calledWith(errorMessage));
            assert.isTrue(tlErrorStub.calledWith(retrievalErrorMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, scanFailureTaskFailureMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(zeroUsersScannedDisplayMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(zeroUsageRecordsScannedDisplayMessage));
        });
    });

    suite('scanCompletedSuccessfully Suite:', () => {
        const taskSuccededMessage = 'All activity originated from within the specified range(s) of IP Addresses.';
        const flaggedUsersErrorMessageSuffix = ' user(s) accessed the VSTS account from an unallowed IP Address that was outside the specified range.';
        const flaggedUserRecordsErrorMessagePrefix = 'User: ';
        const flaggedUserRecordsErrorMessageMiddle = ' had: ';
        const flaggedUserTotalRecordsErrorMessageSuffix = ' total usage record(s) during the scan period.';
        const flaggedUserMatchedRecordsErrorMessageSuffix = ' usage record(s) from an unallowed IP Address.';
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
        // const recordDetailEndMessage = ' End: ';
        const recordDetailUserAgentMessage = ' UserAgent: ';
        const recordDetailAuthenticationMechanismAgentMessage = ' AuthenticationMechanism: ';
        const firstFlaggedUsageRecord = testHelpers.firstUsageRecord;
        const firstRecordDetailsMessage = recordDetailIpAddressMessage + firstFlaggedUsageRecord.ipAddress + recordDetailApplicationMessage +
            firstFlaggedUsageRecord.application + recordDetailCommandMessage + firstFlaggedUsageRecord.command + recordDetailStartMessage +
            firstFlaggedUsageRecord.startTime + recordDetailUserAgentMessage +
            firstFlaggedUsageRecord.userAgent + recordDetailAuthenticationMechanismAgentMessage + firstFlaggedUsageRecord.authenticationMechanism;
        const secondFlaggedUsageRecord = testHelpers.secondUsageRecord;
        const secondRecordDetailsMessage = recordDetailIpAddressMessage + secondFlaggedUsageRecord.ipAddress + recordDetailApplicationMessage +
            secondFlaggedUsageRecord.application + recordDetailCommandMessage + secondFlaggedUsageRecord.command + recordDetailStartMessage +
            secondFlaggedUsageRecord.startTime + recordDetailUserAgentMessage +
            secondFlaggedUsageRecord.userAgent + recordDetailAuthenticationMechanismAgentMessage + secondFlaggedUsageRecord.authenticationMechanism;

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
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.deepEqual(scanReport.numUsersWithFlaggedRecords, 2);
            assert.isTrue(tlErrorStub.calledWith(2 + flaggedUsersErrorMessageSuffix));
            assert.isTrue(taskLoggerLogStub.calledWith(normTotalRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(normFlaggedRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(secondRecordDetailsMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(baileyTotalRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(baileyFlaggedRecordsErrorMessage));
            assert.isTrue(tlErrorStub.calledWith(firstRecordDetailsMessage));
        });

        test('Should display correct usage details when the report contains unscanned activity', async () => {
            addUnscannedUserRecordsToScanReport();
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.deepEqual(scanReport.unscannedUserActivityReports.length, 1);
            assert.isTrue(tlErrorStub.calledWith('Unable to scan the usage records for: 1 user(s).'));
            assert.isTrue(tlErrorStub.calledWith(enableDebuggingMessage));
            assert.isTrue(tlErrorStub.calledWith('Unable to analyze activity for user: caleb'));
            assert.isTrue(tlDebugStub.calledWith('Error details: '));
            assert.isTrue(tlDebugStub.calledWith('woops'));
            assert.isTrue(tlDebugStub.calledWith('ouch'));
            assert.isTrue(taskLoggerLogStub.calledWith(displayUserCountMessagePrefix + 3 + displayUserCountMessageSuffix));
            assert.isTrue(taskLoggerLogStub.calledWith(displayNumRecordsScannedPrefix + 128 + displayNumRecordsScannedSuffix));
        });

        test('Should fail the task when there are flagged records but no failed scan records', async () => {
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should fail the task when there are flagged records and failed scan records', async () => {
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should fail the task when there are no flagged records but are unscanned scan records', async () => {
            removeFlaggedUserRecordsFromScanReport();
            addUnscannedUserRecordsToScanReport();
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Failed, failedTaskErrorMessage));
        });

        test('Should display usage metrics when scan completes successfully', async () => {
            removeFlaggedUserRecordsFromScanReport();
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(displayUserCountMessagePrefix + 3 + displayUserCountMessageSuffix));
            assert.isTrue(taskLoggerLogStub.calledWith(displayNumRecordsScannedPrefix + 128 + displayNumRecordsScannedSuffix));
        });

        test('Should set the final task result to succeeded when there are no flagged nor failed user scan results', async () => {
            removeFlaggedUserRecordsFromScanReport();
            await task.run();
            assert.isTrue(taskLoggerLogStub.calledWith(scanStartedInfoMessage));
            assert.isTrue(taskLoggerLogStub.calledWith(taskSuccededMessage));
            assert.isTrue(tlSetResultStub.calledWith(tl.TaskResult.Succeeded, null));
        });
    });
});