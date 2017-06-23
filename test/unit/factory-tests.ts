'use strict';

import Chai = require('chai');

import factory = require('./../../src/factory');
import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
import testHelpers = require('./test-helpers');
import VstsGraphApiUserService = require('./../../src/services/vsts-graph-api-user-service');
import VstsUtilizationApiUsageService = require('./../../src/services/vsts-utilization-api-usage-service');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/factory.ts}
 */
suite('Factory Suite:', () => {
    test('Should return the correct instance type for VstsUsageService', () => {
        const usageService = factory.getVstsUsageService();
        assert.instanceOf<IVstsUsageService>(usageService, VstsUtilizationApiUsageService);
    });

    test('Should return the correct instance type for VstsUserService', () => {
        const userService = factory.getVstsUserService();
        assert.instanceOf<IVstsUserService>(userService, VstsGraphApiUserService);
    });
});