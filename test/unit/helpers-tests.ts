'use strict';

import Chai = require('chai');
import helpers = require('./../../src/helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/services/vsts-graph-api-user-service.ts}
 */
suite('Helpers Suite:', () => {
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