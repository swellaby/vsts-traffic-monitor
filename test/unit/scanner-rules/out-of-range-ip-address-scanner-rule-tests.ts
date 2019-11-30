'use strict';

import Chai = require('chai');

import OutOfRangeIpAddressScannerRule = require('./../../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import testHelpers = require('./../test-helpers');
import vstsHelpers = require('./../../../src/vsts-helpers');
import IpAddressScanRequest = require('../../../src/models/ip-address-scan-request');
import AuthMechanism = require('../../../src/enums/auth-mechanism');
import VstsUsageRecord = require('../../../src/models/vsts-usage-record');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.
// tslint:disable-next-line:variable-name
const Sinon = require('sinon');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {OutOfRangeIpAddressScannerRule} class
 * defined in {@link ./src/scanner-rules/out-of-range-ip-address-scanner-rule.ts}
 */
suite('OutOfRangeIpAddressScannerRule Tests:', () => {
    const emptyIpRange: string[] = [];

    teardown(() => {
        Sinon.restore();
    });

    suite('Constructor Suite:', () => {
        let ipRangeHelperIsIPStub;
        let ipRangeHelperIsRangeStub;

        setup(() => {
            ipRangeHelperIsIPStub = Sinon.stub(ipRangeHelper, 'isIP').callsFake(() => true);
            ipRangeHelperIsRangeStub = Sinon.stub(ipRangeHelper, 'isRange').callsFake(() => {
                return true;
            });
        });

        const invalidParamsErrorMessage = 'Invalid constructor parameters. scanRequest and usageRecordOriginValidators must be specified';
        const invalidAllowedIpAddressParamErrorMessage = 'Invalid constructor parameters. allowedIpRanges parameter must be a non-empty array of valid values';
        const invalidIpErrorMessage = 'Specified allowedIpRanges contains one or more invalid values. All values must be a valid IPv4 or ' +
            'IPv6 address, or a valid CIDR block';

        test('Should throw an error when scanRequest is null, and originValidator array is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when scanRequest is null, includeInternalVstsServices is null, and originValidator array is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined), invalidParamsErrorMessage);
        });

        test('Should throw an error when scanRequest is null, and originValidator array is empty', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, []), invalidParamsErrorMessage);
        });

        test('Should throw an error when scanRequest is null, and originValidator array is valid', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(null, testHelpers.usageRecordOriginValidators), invalidParamsErrorMessage);
        });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is undefined, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is undefined, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is undefined, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is undefined, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, undefined, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is false, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, false, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is false, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, false, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is false, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, false, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is false, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, false, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is true, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, true, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is true, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, true, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is true, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, true, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is null, includeInternalVstsServices is true, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(null, true, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        test('Should throw an error when allowedIpRanges is undefined, and originValidator array is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined, and originValidator array is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, undefined), invalidParamsErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined, and originValidator array is empty', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, []), invalidParamsErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is undefined, and originValidator array is valid', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, testHelpers.usageRecordOriginValidators), invalidParamsErrorMessage);
        });

        // test('Should throw an error when allowedIpRanges is undefined, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is undefined, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, undefined, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is undefined, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, undefined, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is undefined, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, undefined, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is false, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, false, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is false, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, false, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is false, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, false, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is false, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, false, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is true, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, true, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is true, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, true, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is true, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, true, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is undefined, includeInternalVstsServices is true, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(undefined, true, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        test('Should throw an error when allowedIpRanges is empty, and originValidator array is null', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(<IpAddressScanRequest> { allowedIpRanges: emptyIpRange }, null), invalidParamsErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty, and originValidator array is undefined', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(<IpAddressScanRequest> { allowedIpRanges: emptyIpRange }, undefined), invalidParamsErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty, and originValidator array is empty', () => {
            assert.throws(() => new OutOfRangeIpAddressScannerRule(<IpAddressScanRequest> { allowedIpRanges: emptyIpRange }, []), invalidAllowedIpAddressParamErrorMessage);
        });

        test('Should throw an error when allowedIpRanges is empty, and originValidator array is valid', () => {
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: emptyIpRange };
            assert.throws(() => new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators), invalidAllowedIpAddressParamErrorMessage);
        });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is undefined, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, undefined, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is undefined, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, undefined, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is undefined, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, undefined, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is undefined, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, undefined, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is false, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, false, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is false, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, false, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is false, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, false, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is false, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, false, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is true, and originValidator array is null', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, true, null), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is true, and originValidator array is undefined', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, true, undefined), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is true, and originValidator array is empty', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, true, []), errorMessage);
        // });

        // test('Should throw an error when allowedIpRanges is empty, includeInternalVstsServices is true, and originValidator array is valid', () => {
        //     assert.throws(() => new OutOfRangeIpAddressScannerRule(emptyIpRange, true, testHelpers.usageRecordOriginValidators), errorMessage);
        // });

        test('Should throw an error when allowedIpRanges contains an invalid value', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: [ 'fooobar' ] };
            assert.throws(() => new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators), invalidIpErrorMessage);
        });

        test('Should return a new instance when a valid IP is included', () => {
            ipRangeHelperIsRangeStub.callsFake(() => { return false; });
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: [ testHelpers.fourthValidIpAddress ] };
            const rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            assert.isNotNull(rule);
            assert.instanceOf<OutOfRangeIpAddressScannerRule>(rule, OutOfRangeIpAddressScannerRule);
        });

        test('Should return a new instance when a valid IP range is included', () => {
            ipRangeHelperIsIPStub.callsFake(() => { return false; });
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: [ testHelpers.validIpRange ] };
            const rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            assert.isNotNull(rule);
            assert.instanceOf<OutOfRangeIpAddressScannerRule>(rule, OutOfRangeIpAddressScannerRule);
        });
    });

    suite('scanRecordForMatch Suite:', () => {
        const invalidUsageRecordErrorMessage = 'Invalid parameter. usageRecord cannot be null nor undefined';
        let rule: OutOfRangeIpAddressScannerRule;
        let ipRangeHelperInRangeStub;
        let vstsHelpersIsInternalVstsServiceToServiceCallStub;

        setup(() => {
            ipRangeHelperInRangeStub = Sinon.stub(ipRangeHelper, 'inRange').callsFake(() => {
                return false;
            });
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: [ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ], includeInternalVstsServices: false };
            rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            vstsHelpersIsInternalVstsServiceToServiceCallStub = Sinon.stub(vstsHelpers, 'isInternalVstsServiceToServiceCall').callsFake(() => {
                return false;
            });
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
            vstsHelpersIsInternalVstsServiceToServiceCallStub.callsFake(() => true);
            const isFlagged = rule.scanRecordForMatch(testHelpers.internalVstsServiceUsageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return true when record has an invalid IP and authMechanism is any', () => {
            const scanRequest = <IpAddressScanRequest> {
                allowedIpRanges: [ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ],
                includeInternalVstsServices: true,
                targetAuthMechanism: AuthMechanism.any
            };
            rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            const isFlagged = rule.scanRecordForMatch(testHelpers.secondUsageRecord);
            assert.isTrue(isFlagged);
        });

        test('Should return true when record has an invalid IP with PAT auth and authMechanism is pat', () => {
            const scanRequest = <IpAddressScanRequest> {
                allowedIpRanges: [ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ],
                includeInternalVstsServices: true,
                targetAuthMechanism: AuthMechanism.pat
            };
            rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            const isFlagged = rule.scanRecordForMatch(testHelpers.secondUsageRecord);
            assert.isTrue(isFlagged);
        });

        test('Should return false when record has an invalid IP with non-PAT auth and authMechanism is pat', () => {
            const scanRequest = <IpAddressScanRequest> {
                allowedIpRanges: [ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ],
                includeInternalVstsServices: true,
                targetAuthMechanism: AuthMechanism.pat
            };
            const usageRecord: VstsUsageRecord = JSON.parse(JSON.stringify(testHelpers.secondUsageRecord));
            usageRecord.authenticationMechanism = 'UserAuthToken';
            rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            const isFlagged = rule.scanRecordForMatch(usageRecord);
            assert.isFalse(isFlagged);
        });

        test('Should return true on internal VSTS service record with invalid IP when configured to include', () => {
            vstsHelpersIsInternalVstsServiceToServiceCallStub.callsFake(() => true);
            const scanRequest = <IpAddressScanRequest> { allowedIpRanges: [ testHelpers.validIpRange, testHelpers.fifthValidIpAddress ], includeInternalVstsServices: true };
            rule = new OutOfRangeIpAddressScannerRule(scanRequest, testHelpers.usageRecordOriginValidators);
            const isFlagged = rule.scanRecordForMatch(testHelpers.internalVstsServiceUsageRecord);
            assert.isTrue(isFlagged);
        });
    });
});
