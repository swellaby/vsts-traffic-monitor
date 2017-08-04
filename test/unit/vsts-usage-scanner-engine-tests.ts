'use strict';

import Chai = require('chai');
import Sinon = require('sinon');

import OutOfRangeIpAddressRule = require('./../../src/scanner-rules/out-of-range-ip-address-rule');
import testHelpers = require('./test-helpers');
import VstsUsageRecord = require('./../../src/models/vsts-usage-record');
import vstsUsageScannerEngine = require('./../../src/vsts-usage-scanner-engine');
import VstsUsageScanResult = require('./../../src/models/vsts-usage-scan-result');

const assert = Chai.assert;

/**
 * Contains unit tests for the VSTS Usage Scanner Engine functions
 * defined in {@link ./src/vsts-usage-scanner-engine.ts}
 */
suite('VstsUsageScannerEngine Suite:', () => {
    const sandbox = Sinon.sandbox.create();
    const emptyUsageRecords: VstsUsageRecord[] = [];

    teardown(() => {
        sandbox.restore();
    });

    // eslint-disable-next-line max-statements
    suite('scanUserIpAddresses', () => {
        const invalidParamsErrorMessage = 'Invalid parameters. Must specify valid usageRecords and ipScannerRule.';
        let ruleStub: OutOfRangeIpAddressRule;
        let ruleScanRecordForMatchStub: Sinon.SinonStub;

        setup(() => {
            ruleStub = new OutOfRangeIpAddressRule(testHelpers.validIpRanges, false);
            ruleScanRecordForMatchStub = sandbox.stub(ruleStub, 'scanRecordForMatch').callsFake(() => {
                return false;
            });
        });

        test('Should throw an error when usageRecords is null and scanner rule is null', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(null, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is null and scanner rule is undefined', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(null, undefined), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is null and scanner rule is valid', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(null, ruleStub), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is undefined and scanner rule is null', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(undefined, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is undefined and scanner rule is undefined', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(undefined, undefined), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is undefined and scanner rule is valid', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(undefined, ruleStub), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is empty and scanner rule is null', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(emptyUsageRecords, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when usageRecords is empty and scanner rule is undefined', () => {
            assert.throws(() => vstsUsageScannerEngine.scanUserIpAddresses(emptyUsageRecords, undefined), invalidParamsErrorMessage);
        });

        test('Should return an empty scan result when usageRecords is empty and scanner rule is valid', () => {
            const scanResult: VstsUsageScanResult = vstsUsageScannerEngine.scanUserIpAddresses(emptyUsageRecords, ruleStub);
            assert.isNotNull(scanResult);
            assert.deepEqual(scanResult.scannedRecordCount, 0);
            assert.isFalse(ruleScanRecordForMatchStub.called);
        });

        test('Should return an correct scan result when usageRecords contains matched records', () => {
            ruleScanRecordForMatchStub.onFirstCall().callsFake(() => {
                return true;
            });
            ruleScanRecordForMatchStub.onSecondCall().callsFake(() => {
                return false;
            });
            const scanResult: VstsUsageScanResult = vstsUsageScannerEngine.scanUserIpAddresses(testHelpers.usageRecords, ruleStub);
            assert.isNotNull(scanResult);
            assert.deepEqual(scanResult.scannedRecordCount, 2);
            assert.deepEqual(scanResult.matchedRecords.length, 1);
            assert.deepEqual(scanResult.matchedRecords[0], testHelpers.usageRecords[0]);
        });

        test('Should return an correct scan result when usageRecords contains a record that errors on scan', () => {
            const scanErrorMessage = 'Oh no!';
            ruleScanRecordForMatchStub.onFirstCall().callsFake(() => {
                throw new Error(scanErrorMessage);
            });
            ruleScanRecordForMatchStub.onSecondCall().callsFake(() => {
                return false;
            });
            const scanResult: VstsUsageScanResult = vstsUsageScannerEngine.scanUserIpAddresses(testHelpers.usageRecords, ruleStub);
            assert.isNotNull(scanResult);
            assert.deepEqual(scanResult.scannedRecordCount, 2);
            assert.deepEqual(scanResult.matchedRecords.length, 0);
            assert.deepEqual(scanResult.erroredScanRecords.length, 1);
            assert.deepEqual(scanResult.erroredScanRecords[0], testHelpers.usageRecords[0]);
            assert.deepEqual(scanResult.recordScanErrorMessages[0], scanErrorMessage);
        });
    });

    suite('scanRecords Suite:', () => {
        test('Should throw not implemented exception', () => {
            const errorMessage = 'Not yet implemented.';
            assert.throws(() => vstsUsageScannerEngine.scanRecords(null, null), errorMessage);
        });
    });
});