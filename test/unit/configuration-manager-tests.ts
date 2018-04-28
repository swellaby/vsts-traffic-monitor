'use strict';

import Chai = require('chai');
import nconf = require('nconf');
import Sinon = require('sinon');

import testHelpers = require('./test-helpers');
import ConfigurationManager = require('./../../src/configuration-manager');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/configuration-manager.ts}
 */
suite('ConfigurationManager Suite:', () => {
    const sandbox = Sinon.sandbox.create();
    let nconfGetStub: Sinon.SinonStub;
    let nconfSetStub: Sinon.SinonStub;
    const allowedIpRangesKey = 'allowedIpRanges';

    setup(() => {
        nconfGetStub = sandbox.stub(nconf, 'get').callsFake(() => {
            return testHelpers.emptyString;
        });
        nconfSetStub = sandbox.stub(nconf, 'set').callsFake(() => {
            return;
        });
    });

    teardown(() => {
        sandbox.restore();
    });

    test('Should return the correct value of allowed ip ranges', () => {
        const value = testHelpers.allowedIpRanges;
        nconfGetStub.callsFake(() => {
            return value;
        });
        const allowedIpRanges = ConfigurationManager.getAllowedIpRanges();
        assert.isTrue(nconfGetStub.calledWith(allowedIpRangesKey));
        assert.deepEqual(allowedIpRanges, value);
    });

    test('Should correctly set the value of Valid Ip Ranges', () => {
        ConfigurationManager.setAllowedIpRanges(testHelpers.allowedIpRanges);
        assert.isTrue(nconfSetStub.calledWith(allowedIpRangesKey, testHelpers.allowedIpRanges));
    });
});