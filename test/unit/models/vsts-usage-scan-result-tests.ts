'use strict';

import Chai = require('chai');
import VstsUsageScanResult = require('./../../../src/models/vsts-usage-scan-result');

const assert = Chai.assert;

/**
 * Contains unit tests for the VstsUsageScanResult class defined in {@link ./src/models/vsts-usage-scan-result.ts}
 */
suite('VstsUsageScannerEngine Suite:', () => {
    let scanResult: VstsUsageScanResult;

    setup(() => {
        scanResult = new VstsUsageScanResult();
    });

    teardown(() => {
        scanResult = null;
    });

    test('Should have default of 0 for total records scanned', () => {
        assert.deepEqual(scanResult.scannedRecordCount, 0);
    });

    test('Should have default value of false for containsMatchedRecords', () => {
        assert.isFalse(scanResult.containsMatchedRecords);
    });

    test('Should have default value of false for containsRecordScanErrors', () => {
        assert.isFalse(scanResult.containsRecordScanErrors);
    });

    test('Should have default empty array of matched records', () => {
        assert.deepEqual(scanResult.matchedRecords.length, 0);
    });

    test('Should have default empty array of recordScanErrorMessages', () => {
        assert.deepEqual(scanResult.recordScanErrorMessages.length, 0);
    });

    test('Should have default empty array of erroredScanRecords', () => {
        assert.deepEqual(scanResult.erroredScanRecords.length, 0);
    });
});