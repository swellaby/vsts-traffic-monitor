'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import testHelpers = require('./test-helpers');
import ConfigurationManager = require('./../../src/configuration-manager');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/configuration-manager.ts}
 */
suite('ConfigurationManager Suite:', () => {
    const sandbox = Sinon.sandbox.create();

    teardown(() => {
        sandbox.restore();
    });

    test('Should correctly set the value of Valid Ip Ranges', () => {
        ConfigurationManager.setValidIpRanges(testHelpers.validIpRanges);
        const ranges = ConfigurationManager.getValidIpRanges();
        assert.deepEqual(ranges.length, 2);
        assert.deepEqual(ranges[0], testHelpers.validIpRange);
        assert.deepEqual(ranges[1], testHelpers.fourthValidIpAddress);
    });
});