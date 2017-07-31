'use strict';

import Chai = require('chai');
import Sinon = require('sinon');

import InvalidIpAddressRule = require('./../../../src/scanner-rules/invalid-ip-address-rule');
import testHelpers = require('./../test-helpers');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/scanner-rules/invalid-ip-address-rule.ts}
 */
suite('InvalidIpAddressRule Tests:', () => {
    const sandbox = Sinon.sandbox.create();
    const emptyIpRange: string[] = [];
    const validIp = '192.168.2.0';
    const validIpRange = '255.255.255.248/29';

    teardown(() => {
        sandbox.restore();
    });

    // eslint-disable-next-line max-statements
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

        const errorMessage = 'Invalid constructor parameters. validIpRanges parameter must be a non-empty array of valid values.';
        const invalidIpErrorMessage = 'Specified validIpRanges contains one or more invalid values. All values must be a valid IPv4 or ' +
            'IPv6 address, or a valid CIDR block'

        test('Should throw an error when validIpRanges is null and includeInternalVstsServices is null', () => {
            assert.throws(() => new InvalidIpAddressRule(null, null), errorMessage);
        });

        test('Should throw an error when validIpRanges is null and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new InvalidIpAddressRule(null, undefined), errorMessage);
        });

        test('Should throw an error when validIpRanges is null and includeInternalVstsServices is false', () => {
            assert.throws(() => new InvalidIpAddressRule(null, false), errorMessage);
        });

        test('Should throw an error when validIpRanges is null and includeInternalVstsServices is true', () => {
            assert.throws(() => new InvalidIpAddressRule(null, true), errorMessage);
        });

        test('Should throw an error when validIpRanges is undefined and includeInternalVstsServices is null', () => {
            assert.throws(() => new InvalidIpAddressRule(undefined, null), errorMessage);
        });

        test('Should throw an error when validIpRanges is undefined and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new InvalidIpAddressRule(undefined, undefined), errorMessage);
        });

        test('Should throw an error when validIpRanges is undefined and includeInternalVstsServices is false', () => {
            assert.throws(() => new InvalidIpAddressRule(undefined, false), errorMessage);
        });

        test('Should throw an error when validIpRanges is undefined and includeInternalVstsServices is true', () => {
            assert.throws(() => new InvalidIpAddressRule(undefined, true), errorMessage);
        });

        test('Should throw an error when validIpRanges is empty and includeInternalVstsServices is null', () => {
            assert.throws(() => new InvalidIpAddressRule(emptyIpRange, null), errorMessage);
        });

        test('Should throw an error when validIpRanges is empty and includeInternalVstsServices is undefined', () => {
            assert.throws(() => new InvalidIpAddressRule(emptyIpRange, undefined), errorMessage);
        });

        test('Should throw an error when validIpRanges is empty and includeInternalVstsServices is false', () => {
            assert.throws(() => new InvalidIpAddressRule(emptyIpRange, false), errorMessage);
        });

        test('Should throw an error when validIpRanges is empty and includeInternalVstsServices is true', () => {
            assert.throws(() => new InvalidIpAddressRule(emptyIpRange, true), errorMessage);
        });

        test('Should throw an error when validIpRanges contains an invalid value', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            assert.throws(() => new InvalidIpAddressRule([ 'fooobar' ], true), invalidIpErrorMessage);
        });

        test('Should return a new instance when a valid IP is included', () => {
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            const rule = new InvalidIpAddressRule([ validIp ], true);
            assert.isNotNull(rule);
            assert.instanceOf<InvalidIpAddressRule>(rule, InvalidIpAddressRule);
        });

        test('Should return a new instance when a valid IP range is included', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            const rule = new InvalidIpAddressRule([ validIpRange ], true);
            assert.isNotNull(rule);
            assert.instanceOf<InvalidIpAddressRule>(rule, InvalidIpAddressRule);
        });
    });

    // eslint-disable-next-line max-statements
    suite('flagRecord Suite:', () => {
        const invalidUsageRecordErrorMessage = 'Invalid parameter. usageRecord cannot be null nor undefined';
        let rule: InvalidIpAddressRule;
        let ipRangeHelperInRangeStub: Sinon.SinonStub;

        setup(() => {
            ipRangeHelperInRangeStub = sandbox.stub(ipRangeHelper, 'inRange').callsFake(() => {
                return false;
            });

            rule = new InvalidIpAddressRule([ validIpRange, validIp ], false);
        });

        teardown(() => {
            rule = null;
        });

        test('Should throw an error when usageRecord is null', () => {
            assert.throws(() => rule.flagRecord(null), invalidUsageRecordErrorMessage);
        });

        test('Should throw an error when usageRecord is undefined', () => {
            assert.throws(() => rule.flagRecord(undefined), invalidUsageRecordErrorMessage);
        });

        test('Should return false if the usageRecord does not contain an IP Address', () => {
            ipRangeHelperInRangeStub.callsFake(() => { return true; });

            const isFlagged = rule.flagRecord(testHelpers.nullIpUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return false when IP is in range', () => {
            ipRangeHelperInRangeStub.callsFake(() => { return true; });

            const isFlagged = rule.flagRecord(testHelpers.firstUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return false when record is from an internal VSTS service with invalid IP', () => {
            const isFlagged = rule.flagRecord(testHelpers.internalVstsServiceUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return true when record has an invalid IP', () => {
            const isFlagged = rule.flagRecord(testHelpers.secondUsageRecord);
            assert.isTrue(isFlagged);
        });

        test('Should return true on internal VSTS service record with invalid IP when configured to include', () => {
            rule = new InvalidIpAddressRule([ validIpRange, validIp ], true);
            const isFlagged = rule.flagRecord(testHelpers.internalVstsServiceUsageRecord);
            assert.isTrue(isFlagged);
        });
    })
});