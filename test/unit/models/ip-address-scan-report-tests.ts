'use strict';

import Chai = require('chai');

import IpAddressScanReport = require('./../../../src/models/ip-address-scan-report');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
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
});