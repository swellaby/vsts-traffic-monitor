'use strict';

import Chai = require('chai');
import vstsUserOrigin = require('./../../../src/enums/vsts-user-origin');

const assert = Chai.assert;

/**
 * Contains unit tests for the enum defined in {@link ./src/enums/vsts-user-origin.ts}
 */
suite('VstsUserOrigin Suite:', () => {
    test('Should have the correct value for Azure AD origin', () => {
        assert.deepEqual(vstsUserOrigin.aad, 0);
    });

    test('Should have the correct value for the origin for All users', () => {
        assert.deepEqual(vstsUserOrigin.all, 1);
    });
});