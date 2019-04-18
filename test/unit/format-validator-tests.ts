'use strict';

import Chai = require('chai');

import formatValidator = require('../../src/format-validator');
import testHelpers = require('./test-helpers');

const assert = Chai.assert;

suite('Format Validator Suite:', () => {
    suite('isValidGuid Suite:', () => {
        test('Should return false when the input is null', () => {
            assert.isFalse(formatValidator.isValidGuid(null));
        });

        test('Should return false when the input is undefined', () => {
            assert.deepEqual(formatValidator.isValidGuid(undefined), false);
        });

        test('Should return false when the input is an invalid guid', () => {
            assert.deepEqual(formatValidator.isValidGuid('!@#$%'), false);
        });

        test('Should return true when the input is a valid guid format', () => {
            assert.deepEqual(formatValidator.isValidGuid(testHelpers.sampleGuid), true);
        });
    });

    suite('isValidIsoFormat Suite:', () => {
        test('Should return false when the input is null', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(null), false);
        });

        test('Should return false when the input is undefined', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(undefined), false);
        });

        test('Should return false when the input is not a valid ISO formatted string', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat('abc230497*&%754'), false);
        });

        test('Should return true when the input is a valid ISO format with no decimals', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatNoDecimalString), true);
        });

        test('Should return false when the input contains an invalid decimal formatted ISO', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatInvalidDecimalString), false);
        });

        test('Should return true when the input is a valid ISO format with one decimal place', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatOneDecimalString), true);
        });

        test('Should return true when the input is a valid ISO format with two decimal places', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatTwoDecimalsString), true);
        });

        test('Should return true when the input is a valid ISO format with three decimal places', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatThreeDecimalsString), true);
        });

        test('Should return false when the input is a valid ISO format with four decimal places', () => {
            assert.deepEqual(formatValidator.isValidIsoFormat(testHelpers.isoFormatFourDecimalsString), false);
        });
    });
});
