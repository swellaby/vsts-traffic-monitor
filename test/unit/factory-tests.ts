'use strict';

import Chai = require('chai');

import factory = require('./../../src/factory');
import IOutOfRangeIpAddressScannerRule = require('./../../src/interfaces/out-of-range-ip-address-scanner-rule');
import IUsageRecordOriginValidator = require('./../../src/interfaces/usage-record-origin-validator');
import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import testHelpers = require('./test-helpers');
import VstsAuthMechanismUsageRecordOriginValidator = require('./../../src/validators/vsts-auth-mechanism-usage-record-origin-validator');
import VstsIpAddressUsageRecordOriginValidator = require('./../../src/validators/vsts-ip-address-usage-record-origin-validator');
import VstsGraphApiUserService = require('./../../src/services/vsts-graph-api-user-service');
import VstsUserAgentUsageRecordOriginValidator = require('./../../src/validators/vsts-user-agent-usage-record-origin-validator');
import VstsUtilizationApiUsageService = require('./../../src/services/vsts-utilization-api-usage-service');
import IpAddressScanRequest = require('../../src/models/ip-address-scan-request');

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
        const scannerRule = factory.getOutOfRangeIpAddressScannerRule(<IpAddressScanRequest>{ allowedIpRanges: testHelpers.allowedIpRanges });
        assert.instanceOf<IOutOfRangeIpAddressScannerRule>(scannerRule, OutOfRangeIpAddressScannerRule);
    });

    suite('getUsageRecordOriginValidators Suite:', () => {
        const usageRecordOriginValidators: IUsageRecordOriginValidator[] = factory.getUsageRecordOriginValidators();

        test('Should have the correct number of validators', () => {
            assert.deepEqual(usageRecordOriginValidators.length, 3);
        });

        test('Should provide the originValidators in the correct order', () => {
            assert.instanceOf<IUsageRecordOriginValidator>(usageRecordOriginValidators[0], VstsIpAddressUsageRecordOriginValidator);
            assert.instanceOf<IUsageRecordOriginValidator>(usageRecordOriginValidators[1], VstsAuthMechanismUsageRecordOriginValidator);
            assert.instanceOf<IUsageRecordOriginValidator>(usageRecordOriginValidators[2], VstsUserAgentUsageRecordOriginValidator);
        });
    });
});
