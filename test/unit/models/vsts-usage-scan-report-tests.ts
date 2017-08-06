'use strict';

import Chai = require('chai');

import VstsUsageScanReport = require('./../../../src/models/vsts-usage-scan-report');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
import VstsUserActivityReport = require('./../../../src/models/vsts-user-activity-report');
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
});