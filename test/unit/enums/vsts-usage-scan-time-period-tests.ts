'use strict';

import Chai = require('chai');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {VstsUsageScanTimePeriod} enum defined in {@link ./src/enums/vsts-usage-scan-time-period.ts}
 */
suite('VstsUsageScanTimePeriod Suite:', () => {
    test('Should have the correct value for priorDay', () => {
        assert.deepEqual(vstsUsageScanTimePeriod.priorDay, 0);
    });

    test('Should have the correct string value for priorDay', () => {
        const key = 'priorDay';
        assert.deepEqual(+vstsUsageScanTimePeriod[key], vstsUsageScanTimePeriod.priorDay);
    });

    test('Should have the correct value for the the last24hours', () => {
        assert.deepEqual(vstsUsageScanTimePeriod.last24Hours, 1);
    });

    test('Should have the correct string value for last24hours', () => {
        const key = 'last24Hours';
        assert.deepEqual(+vstsUsageScanTimePeriod[key], vstsUsageScanTimePeriod.last24Hours);
    });
});