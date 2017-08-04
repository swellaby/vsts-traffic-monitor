'use strict';

import chai = require('chai');
import Sinon = require('sinon');

import formatValidator = require('./../../../src/format-validator');
import IsoDateRange = require('./../../../src/models/iso-date-range');
import testHelpers = require('./../test-helpers');

const assert = chai.assert;

/**
 * Contains unit tests for the @see {@link IsoDateRange} class defined in {@link ./src/models/iso-date-range.ts}
 */
suite('IsoDateRange Suite:', () => {
    let dateRange: IsoDateRange;
    const errorMessage = 'Invalid constructor inputs. Both start and end time must be valid ISO strings.';
    const sandbox = Sinon.sandbox.create();
    let formatValidatorIsValidIsoFormatStub: Sinon.SinonStub;

    setup(() => {
        formatValidatorIsValidIsoFormatStub = sandbox.stub(formatValidator, 'isValidIsoFormat');
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(false);
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(false);
    });

    teardown(() => {
        sandbox.restore();
        dateRange = null;
    });

    test('Should throw an error on instantiation when the start time is null and end time is null', () => {
        assert.throws(() => { dateRange = new IsoDateRange(null, null); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is null and end time is undefined', () => {
        assert.throws(() => { dateRange = new IsoDateRange(null, undefined); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is null and end time is an empty string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(null, ''); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is null and end time is an invalid ISO string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(null, testHelpers.invalidIsoFormat); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is null and end time is a valid ISO string', () => {
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(null, testHelpers.isoFormatNoDecimalString); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is undefined and end time is null', () => {
        assert.throws(() => { dateRange = new IsoDateRange(undefined, null); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is undefined and end time is undefined', () => {
        assert.throws(() => { dateRange = new IsoDateRange(undefined, undefined); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is undefined and end time is an empty string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(undefined, ''); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is undefined and end time is an invalid ISO string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(undefined, testHelpers.invalidIsoFormat); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is undefined and end time is a valid ISO string', () => {
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(undefined, testHelpers.isoFormatNoDecimalString); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an empty string and end time is null', () => {
        assert.throws(() => { dateRange = new IsoDateRange('', null); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an empty string and end time is undefined', () => {
        assert.throws(() => { dateRange = new IsoDateRange('', undefined); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an empty string and end time is an empty string', () => {
        assert.throws(() => { dateRange = new IsoDateRange('', ''); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an empty string and end time is an invalid ISO string', () => {
        assert.throws(() => { dateRange = new IsoDateRange('', testHelpers.invalidIsoFormat); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an empty string and end time is a valid ISO string', () => {
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange('', testHelpers.isoFormatNoDecimalString); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is null', () => {
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.invalidIsoFormat, null); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is undefined', () => {
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.invalidIsoFormat, undefined); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is an empty string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.invalidIsoFormat, ''); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is an invalid ISO string', () => {
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.invalidIsoFormat, testHelpers.invalidIsoFormat); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is a valid ISO string', () => {
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.invalidIsoFormat, testHelpers.isoFormatNoDecimalString); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is a valid ISO string and end time is null', () => {
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.isoFormatOneDecimalString, null); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is undefined', () => {
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.isoFormatOneDecimalString, undefined); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is an empty string', () => {
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.isoFormatOneDecimalString, ''); }, errorMessage);
    });

    test('Should throw an error on instantiation when the start time is an invalid ISO string and end time is an invalid ISO string', () => {
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(true);
        assert.throws(() => { dateRange = new IsoDateRange(testHelpers.isoFormatOneDecimalString, testHelpers.invalidIsoFormat); }, errorMessage);
    });

    test('Should have the correct property values when both start and end time params are valid ISO strings.', () => {
        formatValidatorIsValidIsoFormatStub.onFirstCall().returns(true);
        formatValidatorIsValidIsoFormatStub.onSecondCall().returns(true);
        dateRange = new IsoDateRange(testHelpers.isoFormatStartTime, testHelpers.isoFormatEndTime);
        assert.deepEqual(dateRange.isoStartTime, testHelpers.isoFormatStartTime);
        assert.deepEqual(dateRange.isoEndTime, testHelpers.isoFormatEndTime);
    });
});