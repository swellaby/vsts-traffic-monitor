'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import IsoDateRange = require('./../../../src/models/iso-date-range');
import helpers = require('./../../../src/helpers');
import testHelpers = require('./../test-helpers');

/**
 * Contains unit tests for the @see {@link IsoDateRange} class defined in {@link ./src/models/iso-date-range.ts}
 */
suite('IsoDateRange Suite:', () => {
    let dateRange: IsoDateRange;

    teardown(() => {
        dateRange = null;
    });
});