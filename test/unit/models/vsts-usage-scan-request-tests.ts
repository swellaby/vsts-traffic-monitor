'use strict';

import Chai = require('chai');

import testHelpers = require('./../test-helpers');
import VstsUsageScanRequest = require('./../../../src/models/vsts-usage-scan-request');
import vstsUsageScanTimePeriod = require('./../../../src/enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./../../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUsageScanRequest} class defined in {@link ./src/models/vsts-usage-scan-request.ts}
 */
suite('VstsUsageScanRequest Suite:', () => {
    let scanRequest: VstsUsageScanRequest;

    setup(() => {
        scanRequest = new VstsUsageScanRequest();
    });

    teardown(() => {
        scanRequest = null;
    });

    test('Should have accessible property for vstsAccountName', () => {
        assert.deepEqual(scanRequest.vstsAccountName, undefined);
    });

    test('Should have modifiable property for vstsAccountName', () => {
        const accountName = 'swellaby';
        scanRequest.vstsAccountName = accountName;
        assert.deepEqual(scanRequest.vstsAccountName, accountName);
    });

    test('Should have accessible property for vstsAccessToken', () => {
        assert.deepEqual(scanRequest.vstsAccessToken, undefined);
    });

    test('Should have modifiable property for vstsAccessToken', () => {
        scanRequest.vstsAccessToken = testHelpers.sampleGuid;
        assert.deepEqual(scanRequest.vstsAccessToken, testHelpers.sampleGuid);
    });

    test('Should have accessible property for vstsUserOrigin', () => {
        assert.deepEqual(scanRequest.vstsUserOrigin, undefined);
    });

    test('Should have modifiable property for vstsUserOrigin', () => {
        scanRequest.vstsUserOrigin = vstsUserOrigin.all;
        assert.deepEqual(scanRequest.vstsUserOrigin, vstsUserOrigin.all);
    });

    test('Should have accessible property for scanTimePeriod', () => {
        assert.deepEqual(scanRequest.scanTimePeriod, undefined);
    });

    test('Should have modifiable property for scanTimePeriod', () => {
        scanRequest.scanTimePeriod = vstsUsageScanTimePeriod.last24Hours;
        assert.deepEqual(scanRequest.scanTimePeriod, vstsUsageScanTimePeriod.last24Hours);
    });
});