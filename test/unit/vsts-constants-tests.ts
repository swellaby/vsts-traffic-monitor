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
});