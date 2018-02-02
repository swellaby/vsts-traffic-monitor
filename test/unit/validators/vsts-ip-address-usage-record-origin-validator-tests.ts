'use strict';

import Chai = require('chai');

import VstsIpAddressUsageRecordOriginValidator = require('./../../../src/validators/vsts-ip-address-usage-record-origin-validator');
import vstsConstants = require('./../../../src/vsts-constants');
import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');

const assert = Chai.assert;

suite('VstsIpAddressUsageRecordOriginValidator Suite: ', () => {
    let vstsIpAddressUsageRecordOriginValidator: VstsIpAddressUsageRecordOriginValidator;
    let vstsUsageRecord: VstsUsageRecord;
    const invalidParameterErrorMessage = 'Invalid parameter. Must specify a valid usageRecord';

    setup(() => {
        vstsIpAddressUsageRecordOriginValidator = new VstsIpAddressUsageRecordOriginValidator();
        vstsUsageRecord = new VstsUsageRecord();
    });

    teardown(() => {
        vstsIpAddressUsageRecordOriginValidator = null;
        vstsUsageRecord = null;
    });

    test('Should throw an error when usage record is null', () => {
        assert.throws(() => vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should throw an error when usage record is undefined', () => {
        assert.throws(() => vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should return false when the usage record has an unknown IP address', () => {
        vstsUsageRecord.ipAddress = '192.192.192.8';
        assert.isFalse(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known Australia East VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressAustraliaEast;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known Brazil South VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressBrazilSouth;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known Canada Central VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressCanadaCentral;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known Central US VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressCentralUS;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known East Asia VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressEastAsia;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known India South VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressIndiaSouth;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record is the known West Europe VSTS IP Address', () => {
        vstsUsageRecord.ipAddress = vstsConstants.ipAddressWestEurope;
        assert.isTrue(vstsIpAddressUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });
});