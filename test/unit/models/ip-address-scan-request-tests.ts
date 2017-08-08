'use strict';

import Chai = require('chai');

import IpAddressrequest = require('./../../../src/models/ip-address-scan-request');
import testHelpers = require('./../test-helpers');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./../../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link IpAddressrequest} class defined in {@link ./src/models/ip-address-scan-request.ts}
 */
suite('IpAddressrequest Suite:', () => {
    let request: IpAddressrequest;

    setup(() => {
        request = new IpAddressrequest();
    });

    teardown(() => {
        request = null;
    });

    test('Should have accessible property for allowedIpRanges', () => {
        assert.deepEqual(request.allowedIpRanges, undefined);
    });

    test('Should have settable property for allowedIpRanges', () => {
        request.allowedIpRanges = testHelpers.allowedIpRanges;
        assert.deepEqual(request.allowedIpRanges.length, 2);
        assert.deepEqual(request.allowedIpRanges[0], testHelpers.validIpRange);
    });

    test('Should have accessible property to control if records generated from internalVstsUsageService will be included in the scan', () => {
        assert.deepEqual(request.includeInternalVstsServices, undefined);
    });

    test('Should have settable property to control if records generated from internalVstsUsageService will be included in the scan', () => {
        request.includeInternalVstsServices = true;
        assert.isTrue(request.includeInternalVstsServices);
    });

    test('Should have accessible property for vstsAccountName', () => {
        assert.deepEqual(request.vstsAccountName, undefined);
    });

    test('Should have modifiable property for vstsAccountName', () => {
        const accountName = 'swellaby';
        request.vstsAccountName = accountName;
        assert.deepEqual(request.vstsAccountName, accountName);
    });

    test('Should have accessible property for vstsAccessToken', () => {
        assert.deepEqual(request.vstsAccessToken, undefined);
    });

    test('Should have modifiable property for vstsAccessToken', () => {
        request.vstsAccessToken = testHelpers.sampleGuid;
        assert.deepEqual(request.vstsAccessToken, testHelpers.sampleGuid);
    });

    test('Should have accessible property for vstsUserOrigin', () => {
        assert.deepEqual(request.vstsUserOrigin, undefined);
    });

    test('Should have modifiable property for vstsUserOrigin', () => {
        request.vstsUserOrigin = vstsUserOrigin.all;
        assert.deepEqual(request.vstsUserOrigin, vstsUserOrigin.all);
    });

    test('Should have accessible property for scanTimePeriod', () => {
        assert.deepEqual(request.scanTimePeriod, undefined);
    });

    test('Should have modifiable property for scanTimePeriod', () => {
        request.scanTimePeriod = vstsUsageScanTimePeriod.last24Hours;
        assert.deepEqual(request.scanTimePeriod, vstsUsageScanTimePeriod.last24Hours);
    });
});