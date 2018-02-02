'use strict';

import Chai = require('chai');

import VstsUserAgentUsageRecordOriginValidator = require('./../../../src/validators/vsts-user-agent-usage-record-origin-validator');
import vstsConstants = require('./../../../src/vsts-constants');
import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');

const assert = Chai.assert;

suite('VstsAuthMechanismUsageRecordOriginValidator Suite: ', () => {
    let vstsUserAgentUsageRecordOriginValidator: VstsUserAgentUsageRecordOriginValidator;
    let vstsUsageRecord: VstsUsageRecord;
    const invalidParameterErrorMessage = 'Invalid parameter. Must specify a valid usageRecord';

    setup(() => {
        vstsUserAgentUsageRecordOriginValidator = new VstsUserAgentUsageRecordOriginValidator();
        vstsUsageRecord = new VstsUsageRecord();
    });

    teardown(() => {
        vstsUserAgentUsageRecordOriginValidator = null;
        vstsUsageRecord = null;
    });

    test('Should throw an error when usage record is null', () => {
        assert.throws(() => vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should throw an error when usage record is undefined', () => {
        assert.throws(() => vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should return false when the usage record has a null user agent', () => {
        vstsUsageRecord.userAgent = null;
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has an undefined user agent', () => {
        vstsUsageRecord.userAgent = undefined;
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has an empty string user agent', () => {
        vstsUsageRecord.userAgent = '';
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has user agent of random characters', () => {
        vstsUsageRecord.userAgent = 'Aaesrjknsndvca3123';
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has user agent the VSServices in the wrong position', () => {
        vstsUsageRecord.userAgent = 'FVSServices';
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has user agent that starts with the lowercase variant of vsservices', () => {
        vstsUsageRecord.userAgent = 'vsservices';
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has user agent that starts with the uppercase variant of vsservices', () => {
        vstsUsageRecord.userAgent = 'VSSERVICES';
        assert.isFalse(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record has user agent that starts with VSServices', () => {
        vstsUsageRecord.userAgent = vstsConstants.userAgentPrefixValueForServiceToServiceCall;
        assert.isTrue(vstsUserAgentUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });
});