'use strict';

import Chai = require('chai');
import vstsConstants = require('./../../src/vsts-constants');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in ./src/server.ts
 */
suite('VstsConstants Suite:', () => {
    test('Should have the correct value for AAD graph subject type', () => {
        assert.deepEqual(vstsConstants.aadGraphSubjectType, 'aad');
    });

    test('Should have the correct value for MSA graph subject type', () => {
        assert.deepEqual(vstsConstants.msaGraphSubjectType, 'msa');
    });

    test('Should have the correct value for SVC graph subject type', () => {
        assert.deepEqual(vstsConstants.svcGraphSubjectType, 'svc');
    });

    test('Should have the correct value for imported graph subject type', () => {
        assert.deepEqual(vstsConstants.impGraphSubjectType, 'imp');
    });

    test('Should have the correct value for acs graph subject type', () => {
        assert.deepEqual(vstsConstants.acsGraphSubjectType, 'acs');
    });

    test('Should have the correct ipAddress value for Australia East region', () => {
        assert.deepEqual(vstsConstants.ipAddressAustraliaEast, '13.75.145.145');
    });

    test('Should have the correct ipAddress value for Brazil South region', () => {
        assert.deepEqual(vstsConstants.ipAddressBrazilSouth, '191.232.37.247');
    });

    test('Should have the correct ipAddress value for Canada Central region', () => {
        assert.deepEqual(vstsConstants.ipAddressCanadaCentral, '52.237.19.6');
    });

    test('Should have the correct ipAddress value for Central US region', () => {
        assert.deepEqual(vstsConstants.ipAddressCentralUS, '13.89.236.72');
    });

    test('Should have the correct ipAddress value for East Asia (Hong Kong) region', () => {
        assert.deepEqual(vstsConstants.ipAddressEastAsia, '52.175.28.40');
    });

    test('Should have the correct ipAddress value for India South region', () => {
        assert.deepEqual(vstsConstants.ipAddressIndiaSouth, '104.211.227.29');
    });

    test('Should have the correct ipAddress value for West Europe region', () => {
        assert.deepEqual(vstsConstants.ipAddressWestEurope, '40.68.34.220');
    });

    test('Should have correct AuthenticationMechanism value for Internal VSTS Service-To-Service call', () => {
        assert.deepEqual(vstsConstants.authMechanismValueForServiceToServiceCall, 'S2S_ServicePrincipal');
    });

    test('Should have correct UserAgent prefix value for Internal VSTS Service-To-Service call', () => {
        assert.deepEqual(vstsConstants.userAgentPrefixValueForServiceToServiceCall, 'VSServices');
    });
});