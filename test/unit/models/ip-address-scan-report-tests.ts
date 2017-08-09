'use strict';

import Chai = require('chai');

import IpAddressScanReport = require('./../../../src/models/ip-address-scan-report');
import testHelpers = require('./../test-helpers');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
import VstsUser = require('./../../../src/models/vsts-user');
import VstsUserActivityReport = require('./../../../src/models/vsts-user-activity-report');
import vstsUserOrigin = require('./../../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link IpAddressScanReport} class defined in {@link ./src/models/ip-address-scan-report.ts}
 */
suite('IpAddressScanReport Suite:', () => {
    let report: IpAddressScanReport;

    setup(() => {
        report = new IpAddressScanReport();
    });

    teardown(() => {
        report = null;
    });

    test('Should have accessible property for outOfRange record count', () => {
        assert.deepEqual(report.numOutOfRangeIpAddressRecords, 0);
    });

    test('Should have modifiable property for count of outOfRange records', () => {
        report.numOutOfRangeIpAddressRecords = 4;
        assert.deepEqual(report.numOutOfRangeIpAddressRecords, 4);
    });

    test('Should have accessible property for numUsersWithFlaggedRecords', () => {
        assert.deepEqual(report.numUsersWithFlaggedRecords, 0);
    });

    test('Should have modifiable property for count of numUsersWithFlaggedRecords', () => {
        report.numUsersWithFlaggedRecords = 2;
        assert.deepEqual(report.numUsersWithFlaggedRecords, 2);
    });

    test('Should have accessible property for userActivityReports', () => {
        assert.deepEqual(report.userActivityReports.length, 0);
    });

    test('Should have modifiable property for count of userActivityReports', () => {
        report.userActivityReports.push(new VstsUserActivityReport());
        assert.deepEqual(report.userActivityReports.length, 1);
    });

    test('Should have accessible property for flaggedUserActivityReports', () => {
        assert.deepEqual(report.flaggedUserActivityReports.length, 0);
    });

    test('Should have modifiable property for count of flaggedUserActivityReports', () => {
        report.flaggedUserActivityReports.push(new VstsUserActivityReport());
        report.flaggedUserActivityReports.push(new VstsUserActivityReport());
        assert.deepEqual(report.flaggedUserActivityReports.length, 2);
    });

    test('Should have accessible property for unscannedUserActivityReports', () => {
        assert.deepEqual(report.unscannedUserActivityReports.length, 0);
    });

    test('Should have modifiable property for count of flaggedUserActivityReports', () => {
        report.unscannedUserActivityReports.push(new VstsUserActivityReport());
        assert.deepEqual(report.unscannedUserActivityReports.length, 1);
    });

    test('Should have accessible property for scanPeriod', () => {
        assert.deepEqual(report.scanPeriod, undefined);
    });

    test('Should have modifiable property for scanPeriod', () => {
        report.scanPeriod = vstsUsageScanTimePeriod.last24Hours;
        assert.deepEqual(report.scanPeriod, vstsUsageScanTimePeriod.last24Hours);
    });

    test('Should have accessible property for userOrigin', () => {
        assert.deepEqual(report.userOrigin, undefined);
    });

    test('Should have modifiable property for userOrigin', () => {
        report.userOrigin = vstsUserOrigin.aad;
        assert.deepEqual(report.userOrigin, vstsUserOrigin.aad);
    });

    test('Should have accessible property for totalUsageRecordsScanned', () => {
        assert.deepEqual(report.totalUsageRecordsScanned, 0);
    });

    test('Should have modifiable property for totalUsageRecordsScanned', () => {
        report.totalUsageRecordsScanned = 3;
        assert.deepEqual(report.totalUsageRecordsScanned, 3);
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
        report.numUsersActive = 8;
        assert.deepEqual(report.numUsersActive, 8);
    });

    test('Should have accessible property for numScannerRulesExecuted', () => {
        assert.deepEqual(report.numScannerRulesExecuted, 0);
    });

    test('Should have modifiable property for numScannerRulesExecuted', () => {
        report.numScannerRulesExecuted = 2;
        assert.deepEqual(report.numScannerRulesExecuted, 2);
    });

    test('Should have accessible property for completedSuccessfully', () => {
        assert.deepEqual(report.completedSuccessfully, undefined);
    });

    test('Should have modifiable property for completedSuccessfully', () => {
        report.completedSuccessfully = true;
        assert.isTrue(report.completedSuccessfully);
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
});