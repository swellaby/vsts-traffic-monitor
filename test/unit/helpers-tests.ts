'use strict';

import Chai = require('chai');
import moment = require('moment');
import Sinon = require('sinon');

import helpers = require('./../../src/helpers');
import testHelpers = require('./test-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/helpers.ts}
 */
suite('Helpers Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let momentUtcStub: Sinon.SinonStub;
    const momentStub = {
        subtract: () => { return { }; },
        format: () => { return { }; }
    };
    let momentSubtractStub: Sinon.SinonStub;
    const momentDays = 'day';
    const momentHours = 'hours';

    setup(() => {
        momentUtcStub = sandbox.stub(moment.prototype, 'utc').callsFake(() => {
            return momentStub;
        });
        momentSubtractStub = sandbox.stub(momentStub, 'subtract');
    });

    teardown(() => {
        sandbox.restore();
    });

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

    // eslint-disable-next-line max-statements
    suite('getYesterdayUtcDateRange Suite:', () => {
        const yesterdayStub = {
            startOf: () => { return { }; },
            endOf: () => { return { }; }
        };
        const startOfStub = {
            format: () => { return testHelpers.isoFormatStartTime; }
        };
        const endOfStub = {
            format: () => { return testHelpers.isoFormatEndTime; }
        };
        let yesterdayStartOfStub: Sinon.SinonStub;
        let yesterdayEndOfStub: Sinon.SinonStub;
        // eslint-disable-next-line no-unused-vars
        let helpersIsValidIsoFormatStub: Sinon.SinonStub; // This stub is used to control flow.

        setup(() => {
            momentSubtractStub.callsFake(() => {
                return yesterdayStub;
            });
            yesterdayStartOfStub = sandbox.stub(yesterdayStub, 'startOf').callsFake(() => {
                return startOfStub;
            });
            yesterdayEndOfStub = sandbox.stub(yesterdayStub, 'endOf').callsFake(() => {
                return endOfStub;
            });
            helpersIsValidIsoFormatStub = sandbox.stub(helpers, 'isValidIsoFormat').callsFake(() => {
                return true;
            });
        });

        test('Should use UTC offset', () => {
            helpers.getYesterdayUtcDateRange();
            assert.isTrue(momentUtcStub.called);
        });

        test('Should do a one day offset of current UTC', () => {
            helpers.getYesterdayUtcDateRange();
            assert.isTrue(momentSubtractStub.calledWith(1, momentDays));
        });

        test('Should set start time to beginning of target day', () => {
            helpers.getYesterdayUtcDateRange();
            assert.isTrue(yesterdayStartOfStub.calledWith(momentDays));
        });

        test('Should set end time to end of target day', () => {
            helpers.getYesterdayUtcDateRange();
            assert.isTrue(yesterdayEndOfStub.calledWith(momentDays));
        });

        test('Should provide the correct IsoDateRange object', () => {
            const isoDateRange = helpers.getYesterdayUtcDateRange();
            assert.deepEqual(isoDateRange.isoStartTime, testHelpers.isoFormatStartTime);
            assert.deepEqual(isoDateRange.isoEndTime, testHelpers.isoFormatEndTime);
        });
    });

    suite('getLast24HoursUtcDateRange Suite:', () => {
        const beginningStub = {
            format: () => { return testHelpers.isoFormatStartTime; }
        };
        let beginningFormatStub: Sinon.SinonStub;
        let nowFormatStub: Sinon.SinonStub;
        // eslint-disable-next-line no-unused-vars
        let helpersIsValidIsoFormatStub: Sinon.SinonStub; // This stub is used to control flow.

        setup(() => {
            momentSubtractStub.callsFake(() => {
                return beginningStub;
            });
            nowFormatStub = sandbox.stub(momentStub, 'format').callsFake(() => {
                return testHelpers.isoFormatEndTime;
            });
            beginningFormatStub = sandbox.stub(beginningStub, 'format').callsFake(() => {
                return testHelpers.isoFormatStartTime;
            });
            helpersIsValidIsoFormatStub = sandbox.stub(helpers, 'isValidIsoFormat').callsFake(() => {
                return true;
            });
        });

        test('Should use UTC offset', () => {
            helpers.getLast24HoursUtcDateRange();
            assert.isTrue(momentUtcStub.called);
        });

        test('Should do a 24 hour offset of current UTC', () => {
            helpers.getLast24HoursUtcDateRange();
            assert.isTrue(momentSubtractStub.calledWith(24, momentHours));
        });

        test('Should use beginning time format for UTC start time', () => {
            helpers.getLast24HoursUtcDateRange();
            assert.isTrue(beginningFormatStub.called);
        });

        test('Should set end time to current UTC time', () => {
            helpers.getLast24HoursUtcDateRange();
            assert.isTrue(nowFormatStub.called);
        });

        test('Should provide the correct IsoDateRange object', () => {
            const isoDateRange = helpers.getLast24HoursUtcDateRange();
            assert.deepEqual(isoDateRange.isoStartTime, testHelpers.isoFormatStartTime);
            assert.deepEqual(isoDateRange.isoEndTime, testHelpers.isoFormatEndTime);
        });
    });

    suite('isValidIsoFormat Suite:', () => {
        test('Should return false when the input is null', () => {
            assert.deepEqual(helpers.isValidIsoFormat(null), false);
        });

        test('Should return false when the input is undefined', () => {
            assert.deepEqual(helpers.isValidIsoFormat(undefined), false);
        });

        test('Should return false when the input is not a valid ISO formatted string', () => {
            assert.deepEqual(helpers.isValidIsoFormat('abc230497*&%754'), false);
        });

        test('Should return true when the input is a valid ISO format with no decimals', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatNoDecimalString), true);
        });

        test('Should return false when the input contains an invalid decimal formatted ISO', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatInvalidDecimalString), false);
        });

        test('Should return true when the input is a valid ISO format with one decimal place', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatOneDecimalString), true);
        });

        test('Should return true when the input is a valid ISO format with two decimal places', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatTwoDecimalsString), true);
        });

        test('Should return true when the input is a valid ISO format with three decimal places', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatThreeDecimalsString), true);
        });

        test('Should return false when the input is a valid ISO format with four decimal places', () => {
            assert.deepEqual(helpers.isValidIsoFormat(testHelpers.isoFormatFourDecimalsString), false);
        });
    });
});