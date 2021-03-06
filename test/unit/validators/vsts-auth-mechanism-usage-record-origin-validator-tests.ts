'use strict';

import Chai = require('chai');

import VstsAuthMechanismUsageRecordOriginValidator = require('./../../../src/validators/vsts-auth-mechanism-usage-record-origin-validator');
import vstsConstants = require('./../../../src/vsts-constants');
import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');

const assert = Chai.assert;

suite('VstsAuthMechanismUsageRecordOriginValidator Suite: ', () => {
    let vstsAuthMechanismUsageRecordOriginValidator: VstsAuthMechanismUsageRecordOriginValidator;
    let vstsUsageRecord: VstsUsageRecord;
    const invalidParameterErrorMessage = 'Invalid parameter. Must specify a valid usageRecord';

    setup(() => {
        vstsAuthMechanismUsageRecordOriginValidator = new VstsAuthMechanismUsageRecordOriginValidator();
        vstsUsageRecord = new VstsUsageRecord();
    });

    teardown(() => {
        vstsAuthMechanismUsageRecordOriginValidator = null;
        vstsUsageRecord = null;
    });

    test('Should throw an error when usage record is null', () => {
        assert.throws(() => vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should throw an error when usage record is undefined', () => {
        assert.throws(() => vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(null), invalidParameterErrorMessage);
    });

    test('Should return false when the usage record has a null authentication mechanism', () => {
        vstsUsageRecord.authenticationMechanism = null;
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has an undefined authentication mechanism', () => {
        vstsUsageRecord.authenticationMechanism = undefined;
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has an empty string authentication mechanism', () => {
        vstsUsageRecord.authenticationMechanism = '';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of AAD', () => {
        vstsUsageRecord.authenticationMechanism = 'AAD';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of FedAuth', () => {
        vstsUsageRecord.authenticationMechanism = 'FedAuth';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of PAT_Scoped', () => {
        vstsUsageRecord.authenticationMechanism = 'PAT_Scoped';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of PAT_ScopedGlobal', () => {
        vstsUsageRecord.authenticationMechanism = 'PAT_ScopedGlobal';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of PAT_Unscoped', () => {
        vstsUsageRecord.authenticationMechanism = 'PAT_Unscoped';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of PAT_UnscopedGlobal', () => {
        vstsUsageRecord.authenticationMechanism = 'PAT_UnscopedGlobal';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of SessionToken', () => {
        vstsUsageRecord.authenticationMechanism = 'SessionToken';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of SessionToken_Unscoped', () => {
        vstsUsageRecord.authenticationMechanism = 'SessionToken_Unscoped';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of SessionToken_UnscopedGlobal', () => {
        vstsUsageRecord.authenticationMechanism = 'SessionToken_Unscoped';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return false when the usage record has authentication mechanism of SessionToken_UnscopedGlobal', () => {
        vstsUsageRecord.authenticationMechanism = 'SessionToken_UnscopedGlobal';
        assert.isFalse(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });

    test('Should return true when the usage record has authentication mechanism of S2S_ServicePrincipal', () => {
        vstsUsageRecord.authenticationMechanism = vstsConstants.authMechanismValueForServiceToServiceCall;
        assert.isTrue(vstsAuthMechanismUsageRecordOriginValidator.isInternalVstsServiceToServiceCallOrigin(vstsUsageRecord));
    });
});