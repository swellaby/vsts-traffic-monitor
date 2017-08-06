'use strict';

import Chai = require('chai');

import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');
import VstsUser = require('./../../../src/models/vsts-user');
import VstsUserActivityReport = require('./../../../src/models/vsts-user-activity-report');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUserActivityReport} class defined in {@link ./src/models/vsts-user-activity-report.ts}
 */
suite('VstsUserActivityReport Suite:', () => {
    let report: VstsUserActivityReport;

    setup(() => {
        report = new VstsUserActivityReport();
    });

    teardown(() => {
        report = null;
    });

    test('Should have accessible property for user', () => {
        assert.deepEqual(report.user, undefined);
    });

    test('Should have modifiable property for user', () => {
        const user = new VstsUser();
        report.user = user;
        assert.deepEqual(report.user, user);
    });

    test('Should have accessible property for allUsageRecords', () => {
        assert.deepEqual(report.allUsageRecords.length, 0);
    });

    test('Should have modifiable property for allUsageRecords', () => {
        report.allUsageRecords.push(new VstsUsageRecord());
        assert.deepEqual(report.allUsageRecords.length, 1);
    });

    test('Should have accessible property for matchedUsageRecords', () => {
        assert.deepEqual(report.matchedUsageRecords.length, 0);
    });

    test('Should have modifiable property for matchedUsageRecords', () => {
        report.matchedUsageRecords.push(new VstsUsageRecord());
        report.matchedUsageRecords.push(new VstsUsageRecord());
        assert.deepEqual(report.matchedUsageRecords.length, 2);
    });
});