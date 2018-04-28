'use strict';

import Chai = require('chai');

import testHelpers = require('./../test-helpers');
import VstsUsageScanReport = require('./../../../src/models/vsts-usage-scan-report');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
import VstsUser = require('./../../../src/models/vsts-user');
import vstsUserOrigin = require('./../../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUsageScanReport} class defined in {@link ./src/models/vsts-usage-scan-report.ts}
 */
suite('VstsUsageScanReport Suite:', () => {
    let report: VstsUsageScanReport;

    setup(() => {
        report = new VstsUsageScanReport();
    });

    teardown(() => {
        report = null;
    });

    test('Should have accessible property for completedSuccessfully', () => {
        assert.deepEqual(report.completedSuccessfully, undefined);
    });

    test('Should have modifiable property for completedSuccessfully', () => {
        report.completedSuccessfully = true;
        assert.isTrue(report.completedSuccessfully);
    });

    test('Should have accessible property for scanPeriod', () => {
        assert.deepEqual(report.scanPeriod, undefined);
    });

    test('Should have modifiable property for scanPeriod', () => {
        report.scanPeriod = vstsUsageScanTimePeriod.priorDay;
        assert.deepEqual(report.scanPeriod, vstsUsageScanTimePeriod.priorDay);
    });

    test('Should have accessible property for userOrigin', () => {
        assert.deepEqual(report.userOrigin, undefined);
    });

    test('Should have modifiable property for userOrigin', () => {
        report.userOrigin = vstsUserOrigin.all;
        assert.deepEqual(report.userOrigin, vstsUserOrigin.all);
    });

    test('Should have accessible property for totalUsageRecordsScanned', () => {
        assert.deepEqual(report.totalUsageRecordsScanned, 0);
    });

    test('Should have modifiable property for totalUsageRecordsScanned', () => {
        report.totalUsageRecordsScanned = 5;
        assert.deepEqual(report.totalUsageRecordsScanned, 5);
    });

    test('Should have accessible property for numMatchedUsageRecords', () => {
        assert.deepEqual(report.numMatchedUsageRecords, 0);
    });

    test('Should have modifiable property for numMatchedUsageRecords', () => {
        report.numMatchedUsageRecords = 4;
        assert.deepEqual(report.numMatchedUsageRecords, 4);
    });

    test('Should have accessible property for numUnscannedUsageRecords', () => {
        assert.deepEqual(report.numUnscannedUsageRecords, 0);
    });

    test('Should have modifiable property for numUnscannedUsageRecords', () => {
        report.numUnscannedUsageRecords = 3;
        assert.deepEqual(report.numUnscannedUsageRecords, 3);
    });

    test('Should have accessible property for numUsersActive', () => {
        assert.deepEqual(report.numUsersActive, 0);
    });

    test('Should have modifiable property for numUsersActive', () => {
        report.numUsersActive = 7;
        assert.deepEqual(report.numUsersActive, 7);
    });

    test('Should have accessible property for numScannerRulesExecuted', () => {
        assert.deepEqual(report.numScannerRulesExecuted, 0);
    });

    test('Should have modifiable property for numScannerRulesExecuted', () => {
        report.numScannerRulesExecuted = 1;
        assert.deepEqual(report.numScannerRulesExecuted, 1);
    });

    test('Should have accessible property for errorMessage', () => {
        assert.deepEqual(report.errorMessage, undefined);
    });

    test('Should have modifiable property for errorMessage', () => {
        const message = 'Error rorrE';
        report.errorMessage = message;
        assert.deepEqual(report.errorMessage, message);
    });

    test('Should have accessible property for debugErrorMessage', () => {
        assert.deepEqual(report.debugErrorMessage, undefined);
    });

    test('Should have modifiable property for debugErrorMessage', () => {
        const debugMessage = 'Http foobar';
        report.debugErrorMessage = debugMessage;
        assert.deepEqual(report.debugErrorMessage, debugMessage);
    });

    test('Should have accessible property for vstsAccountName', () => {
        assert.deepEqual(report.vstsAccountName, undefined);
    });

    test('Should have modifiable property for vstsAccountName', () => {
        report.vstsAccountName = testHelpers.vstsAccountName;
        assert.deepEqual(report.vstsAccountName, testHelpers.vstsAccountName);
    });

    test('Should have accessible property for vstsUserOrigin', () => {
        assert.deepEqual(report.vstsUserOrigin, undefined);
    });

    test('Should have modifiable property for vstsUserOrigin', () => {
        report.vstsUserOrigin = vstsUserOrigin.all;
        assert.deepEqual(report.vstsUserOrigin, vstsUserOrigin.all);
    });

    test('Should have accessible property for scanTimePeriod', () => {
        assert.deepEqual(report.scanTimePeriod, undefined);
    });

    test('Should have modifiable property for scanTimePeriod', () => {
        report.scanTimePeriod = vstsUsageScanTimePeriod.last24Hours;
        assert.deepEqual(report.scanTimePeriod, vstsUsageScanTimePeriod.last24Hours);
    });

    test('Should have accessible property for usageRetrievalErrorUsers', () => {
        assert.deepEqual(report.usageRetrievalErrorUsers.length, 0);
    });

    test('Should have modifiable property for count of usageRetrievalErrorUsers', () => {
        report.usageRetrievalErrorUsers.push(new VstsUser());
        report.usageRetrievalErrorUsers.push(new VstsUser());
        assert.deepEqual(report.usageRetrievalErrorUsers.length, 2);
    });

    test('Should have accessible property for usageRetrievalErrorMessages', () => {
        assert.deepEqual(report.usageRetrievalErrorMessages.length, 0);
    });

    test('Should have modifiable property for count of usageRetrievalErrorMessages', () => {
        report.usageRetrievalErrorMessages.push('failed');
        report.usageRetrievalErrorMessages.push('broken');
        assert.deepEqual(report.usageRetrievalErrorMessages.length, 2);
    });
});