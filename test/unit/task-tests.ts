'use strict';

import Chai = require('chai');
import Sinon = require('sinon');
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
    const fatalErrorMessage = 'Fatal error encountered. Unable to scan IP Addresses';
    const vstsAccountParamDisplayMessageBase = 'VSTS Account Scanned: ';
    const scanPeriodParamDisplayMessageBase = 'Scan Period: ';
    const userOriginParamDisplayMessageBase = 'VSTS User Origin: ';
    const includeInternalVstsDisplayMessage = 'Traffic generated from internal VSTS processes was also scanned';
    const excludeInternalVstsDisplayMessage = 'Traffic generated from internal VSTS processes was ignored';
    const allowedIpRangesParamDisplayMessageBase = 'The allowable IPv4 ranges that were used in this scan: ';
    const enableDebuggingMessage = 'Enable debugging to receive more detailed error information';
    const invalidScanReportErrorMessage = 'An internal error occurred. Unable to complete scan.';
    const invalidScanReportDebugMessage = 'The ScanReport object returned from the Monitor was null or undefined. ' +
        'This is not supposed to happen :) Please open an issue on GitHub at https://github.com/swellaby/vsts-traffic-monitor/issues';
    const scanFailureErrorMessageBase = 'An error occurred while attempting to execute the scan. Error details: ';
    const scanFailureTaskFailureMessage = 'Failing the task because the scan was not successfully executed';

    /**
     * Helper method for initializing stubs.
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
    }

    setup(() => {
        setupInputStubs();
        scanReport = new IpAddressScanReport();
        vstsUsageMonitorScanForOutOfRangeIpAddressesStub = sandbox.stub(vstsUsageMonitor, 'scanForOutOfRangeIpAddresses').callsFake(() => {
            return scanReport;
        });
        tlErrorStub = sandbox.stub(tl, 'error').callsFake(() => null);
        tlDebugStub = sandbox.stub(tl, 'debug').callsFake(() => null);
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