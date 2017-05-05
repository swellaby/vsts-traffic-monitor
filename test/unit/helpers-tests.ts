'use strict';

import Chai = require('chai');
import helpers = require('./../../src/helpers');
import testHelpers = require('./test-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/helpers.ts}
 */
suite('Helpers Suite:', () => {
    suite('buildError Suite:', () => {
        const baseErrorMessage = 'Base of basic: ';
        const errorMessageDetails = 'Detailed details';
        const errorMessage = baseErrorMessage + errorMessageDetails;

        test('Should return an error with the base message when the err param is null', () => {
            const error = helpers.buildError(baseErrorMessage, null);
            assert.deepEqual(error.message, baseErrorMessage);
        });

        test('Should return an error with the base message when the err param is undefined', () => {
            const error = helpers.buildError(baseErrorMessage, undefined);
            assert.deepEqual(error.message, baseErrorMessage);
        });

        test('Should return an error with the base message when the err param has an empty message property', () => {
            const error = helpers.buildError(baseErrorMessage, { message: '' });
            assert.deepEqual(error.message, baseErrorMessage);
        });

        // eslint-disable-next-line max-statements
        test('Should return an error with the full message when the err param has a message property', () => {
            const error = helpers.buildError(baseErrorMessage, { message: errorMessageDetails });
            assert.deepEqual(error.message, errorMessage);
        });
    });

    suite('isValidGuid Suite:', () => {
        test('Should return false when the input is null', () => {
            assert.deepEqual(helpers.isValidGuid(null), false);
        });

        test('Should return false when the input is undefined', () => {
            assert.deepEqual(helpers.isValidGuid(undefined), false);
        });

        test('Should return false when the input is an invalid guid', () => {
            assert.deepEqual(helpers.isValidGuid('!@#$%'), false);
        });

        test('Should return true when the input is a valid guid format', () => {
            assert.deepEqual(helpers.isValidGuid(testHelpers.sampleGuid), true);
        });
    });
});