'use strict';

import Chai = require('chai');
import Sinon = require('sinon');

import OutOfRangeIpAddressScannerRule = require('./../../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import testHelpers = require('./../test-helpers');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {OutOfRangeIpAddressScannerRule} class
 * defined in {@link ./src/scanner-rules/out-of-range-ip-address-scanner-rule.ts}
 */
suite('OutOfRangeIpAddressScannerRule Tests:', () => {
    const sandbox = Sinon.sandbox.create();
    const emptyIpRange: string[] = [];

    teardown(() => {
        sandbox.restore();
    });

    suite('Constructor Suite:', () => {
        let ipRangeHelperIsIPStub: Sinon.SinonStub;
        let ipRangeHelperIsRangeStub: Sinon.SinonStub;

        setup(() => {
            ipRangeHelperIsIPStub = sandbox.stub(ipRangeHelper, 'isIP').callsFake(() => {
                return true;
            });

            ipRangeHelperIsRangeStub = sandbox.stub(ipRangeHelper, 'isRange').callsFake(() => {
                return true;
            });
        });

        const errorMessage = 'Invalid constructor parameters. allowedIpRanges parameter must be a non-empty array of valid values.';
        const invalidIpErrorMessage = 'Specified allowedIpRanges contains one or more invalid values. All values must be a valid IPv4 or ' +
            'IPv6 address, or a valid CIDR block';

        test('Should throw an error when allowedIpRanges is null and includeInternalVstsServices is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, null), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is null and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is null and includeInternalVstsServices is false', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, false), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is null and includeInternalVstsServices is true', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, true), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined and includeInternalVstsServices is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, null), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, undefined), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined and includeInternalVstsServices is false', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, false), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined and includeInternalVstsServices is true', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, true), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty and includeInternalVstsServices is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, null), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, undefined), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty and includeInternalVstsServices is false', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, false), errorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty and includeInternalVstsServices is true', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, true), errorMessage);
        });

        test('Should throw an error when allowedIpRanges contains an invalid value', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            assert.throws(() => new OutOfRangeIpAddressScannerRule([ 'fooobar' ], true), invalidIpErrorMessage);
        });

        test('Should return a new instance when a valid IP is included', () => {
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            const rule = new OutOfRangeIpAddressScannerRule([ testHelpers.fourthValidIpAddress ], true);
            assert.isNotNull(rule);
            assert.instanceOf<OutOfRangeIpAddressScannerRule>(rule, OutOfRangeIpAddressScannerRule);
        });

        test('Should return a new instance when a valid IP range is included', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            const rule = new OutOfRangeIpAddressScannerRule([ testHelpers.validIpRange ], true);
            assert.isNotNull(rule);
            assert.instanceOf<OutOfRangeIpAddressScannerRule>(rule, OutOfRangeIpAddressScannerRule);
        });
    });

    suite('scanRecordForMatch Suite:', () => {
        const invalidUsageRecordErrorMessage = 'Invalid parameter. usageRecord cannot be null nor undefined';
        let rule: OutOfRangeIpAddressScannerRule;
        let ipRangeHelperInRangeStub: Sinon.SinonStub;

        setup(() => {
            ipRangeHelperInRangeStub = sandbox.stub(ipRangeHelper, 'inRange').callsFake(() => {
                return false;
            });

            rule = new OutOfRangeIpAddressScannerRule([ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ], false);
        });

        teardown(() => {
            rule = null;
        });

        test('Should throw an error when usageRecord is null', () => {
            assert.throws(() => rule.scanRecordForMatch(null), invalidUsageRecordErrorMessage);
        });

        test('Should throw an error when usageRecord is undefined', () => {
            assert.throws(() => rule.scanRecordForMatch(undefined), invalidUsageRecordErrorMessage);
        });

        test('Should return false if the usageRecord does not contain an IP Address', () => {
            ipRangeHelperInRangeStub.callsFake(() => { return true; });

            const isFlagged = rule.scanRecordForMatch(testHelpers.nullIpUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return false when IP is in range', () => {
            ipRangeHelperInRangeStub.callsFake(() => { return true; });

            const isFlagged = rule.scanRecordForMatch(testHelpers.firstUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return false when record is from an internal VSTS service with invalid IP', () => {
            const isFlagged = rule.scanRecordForMatch(testHelpers.internalVstsServiceUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return true when record has an invalid IP', () => {
            const isFlagged = rule.scanRecordForMatch(testHelpers.secondUsageRecord);
            assert.isTrue(isFlagged);
        });

        test('Should return true on internal VSTS service record with invalid IP when configured to include', () => {
            rule = new OutOfRangeIpAddressScannerRule([ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ], true);
            const isFlagged = rule.scanRecordForMatch(testHelpers.internalVstsServiceUsageRecord);
            assert.isTrue(isFlagged);
        });
    });
});