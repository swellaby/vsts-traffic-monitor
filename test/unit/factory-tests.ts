'use strict';

import Chai = require('chai');

import factory = require('./../../src/factory');
import IOutOfRangeIpAddressScannerRule = require('./../../src/interfaces/out-of-range-ip-address-scanner-rule');
import IUsageRecordOriginValidator = require('./../../src/interfaces/usage-record-origin-validator');
import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import testHelpers = require('./test-helpers');
import VstsIpAddressUsageRecordOriginValidator = require('./../../src/validators/vsts-ip-address-usage-record-origin-validator');
import VstsGraphApiUserService = require('./../../src/services/vsts-graph-api-user-service');
import VstsUtilizationApiUsageService = require('./../../src/services/vsts-utilization-api-usage-service');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/factory.ts}
 */
suite('Factory Suite:', () => {
    test('Should return the correct instance type for VstsUsageService', () => {
        const usageService = factory.getVstsUsageService();
        assert.instanceOf<IVstsUsageService>(usageService, VstsUtilizationApiUsageService);
    });

    test('Should return the correct instance type for VstsUserService', () => {
        const userService = factory.getVstsUserService();
        assert.instanceOf<IVstsUserService>(userService, VstsGraphApiUserService);
    });

    test('Should return the correct instance type of IOutOfRangeIpAddressScannerRule', () => {
        const scannerRule = factory.getOutOfRangeIpAddressScannerRule(testHelpers.allowedIpRanges, false);
        assert.instanceOf<IOutOfRangeIpAddressScannerRule>(scannerRule, OutOfRangeIpAddressScannerRule);
    });

    suite('getUsageRecordOriginValidators Suite:', () => {
        const usageRecordOriginValidators: IUsageRecordOriginValidator[] = factory.getUsageRecordOriginValidators();

        test('Should have the correct number of validators', () => {
            assert.deepEqual(usageRecordOriginValidators.length, 1);
        });

        test('Should provide the originValidators in the correct order', () => {
            assert.instanceOf<IUsageRecordOriginValidator>(usageRecordOriginValidators[0], VstsIpAddressUsageRecordOriginValidator);
        });
    });
});