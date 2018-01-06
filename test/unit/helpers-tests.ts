'use strict';

import Chai = require('chai');
import moment = require('moment');
import Sinon = require('sinon');

import formatValidator = require('./../../src/format-validator');
import helpers = require('./../../src/helpers');
import testHelpers = require('./test-helpers');

const assert = Chai.assert;

/**
 * Contains unit tests for the functions defined in {@link ./src/helpers.ts}
 */
suite('Helpers Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let momentUtcStub: Sinon.SinonStub;
    // eslint-disable-next-line no-unused-vars
    const momentStub: moment.Moment = <moment.Moment> {
        subtract: () => { return { }; },
        format: () => { return { }; },
        // eslint-disable-next-line no-unused-vars
        startOf: (format?: string) => { return { }; }, // eslint-disable-line no-unused-vars
        // eslint-disable-next-line no-unused-vars
        endOf: (format?: string) => { return { }; } // tslint:disable-line:no-unused-vars
    };
    let momentSubtractStub: Sinon.SinonStub;
    const momentDays = 'day';
    const momentHours = 'hours';
    let formatValidatorIsValidIsoFormatStub: Sinon.SinonStub;

    setup(() => {
        momentUtcStub = sandbox.stub(moment.prototype, 'utc').callsFake(() => {
            return momentStub;
        });
        momentSubtractStub = sandbox.stub(momentStub, 'subtract');
        formatValidatorIsValidIsoFormatStub = sandbox.stub(formatValidator, 'isValidIsoFormat').callsFake(() => {
            return true;
        });
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

        test('Should return an error with the full message when the err param has a message property', () => {
            const error = helpers.buildError(baseErrorMessage, { message: errorMessageDetails });
            assert.deepEqual(error.message, errorMessage);
        });
    });

    suite('buildUtcIsoDateRange Suite:', () => {
        const errorMessage = 'Invalid date specified.';
        const startOfStub = {
            format: () => { return testHelpers.isoFormatStartTime; }
        };
        const endOfStub = {
            format: () => { return testHelpers.isoFormatEndTime; }
        };
        let dateStartOfStub: Sinon.SinonStub;
        let dateEndOfStub: Sinon.SinonStub;

        setup(() => {
            dateStartOfStub = sandbox.stub(momentStub, 'startOf').callsFake(() => {
                return startOfStub;
            });
            dateEndOfStub = sandbox.stub(momentStub, 'endOf').callsFake(() => {
                return endOfStub;
            });
        });

        test('Should throw an error when targetDate is null', () => {
            assert.throws(() => { helpers.buildUtcIsoDateRange(null); }, errorMessage);
        });

        test('Should throw an error when targetDate is undefined', () => {
            assert.throws(() => { helpers.buildUtcIsoDateRange(undefined); }, errorMessage);
        });

        test('Should use UTC offset', () => {
            helpers.buildUtcIsoDateRange(new Date());
            assert.isTrue(momentUtcStub.called);
        });

        test('Should set start time to beginning of target day', () => {
            helpers.buildUtcIsoDateRange(new Date());
            assert.isTrue(dateStartOfStub.calledWith(momentDays));
        });

        test('Should set end time to end of target day', () => {
            helpers.buildUtcIsoDateRange(new Date());
            assert.isTrue(dateEndOfStub.calledWith(momentDays));
        });

        test('Should provide the correct IsoDateRange object', () => {
            const isoDateRange = helpers.buildUtcIsoDateRange(new Date());
            assert.deepEqual(isoDateRange.isoStartTime, testHelpers.isoFormatStartTime);
            assert.deepEqual(isoDateRange.isoEndTime, testHelpers.isoFormatEndTime);
            assert.isTrue(formatValidatorIsValidIsoFormatStub.called);
        });
    });

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
            assert.isTrue(formatValidatorIsValidIsoFormatStub.called);
        });
    });

    suite('getLast24HoursUtcDateRange Suite:', () => {
        const beginningStub = {
            format: () => { return testHelpers.isoFormatStartTime; }
        };
        let beginningFormatStub: Sinon.SinonStub;
        let nowFormatStub: Sinon.SinonStub;

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

    suite('sleepAsync Suite:', () => {
        const invalidParamErrorMessage = 'Invalid parameter. Parameter ms must be a valid, positive number.';
        let clock: Sinon.SinonFakeTimers;
        let setTimeoutStub: Sinon.SinonStub;
        const ms = 1500;

        setup(() => {
            clock = sandbox.useFakeTimers();
            setTimeoutStub = sandbox.stub(clock, 'setTimeout').callsFake((resolve, ms) => { resolve(); });
        });

        teardown(() => {
            clock.restore();
        });

        test('Should reject the promise when the ms parameter is null', (done: () => void) => {
            helpers.sleepAsync(null).catch((err: Error) => {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
                done();
            });
        });

        test('Should throw an error when awaited and the ms parameter is null', async () => {
            try {
                await helpers.sleepAsync(null);
            } catch (err) {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
            }
        });

        test('Should reject the promise when the ms parameter is undefined', (done: () => void) => {
            helpers.sleepAsync(undefined).catch((err: Error) => {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
                done();
            });
        });

        test('Should throw an error when awaited and the ms parameter is undefined', async () => {
            try {
                await helpers.sleepAsync(undefined);
            } catch (err) {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
            }
        });

        test('Should reject the promise when the ms parameter is negative', (done: () => void) => {
            helpers.sleepAsync(-50).catch((err: Error) => {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
                done();
            });
        });

        test('Should throw an error when awaited and the ms parameter is negative', async () => {
            try {
                await helpers.sleepAsync(-25);
            } catch (err) {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
            }
        });

        test('Should reject the promise when the ms parameter is zero', (done: () => void) => {
            helpers.sleepAsync(0).catch((err: Error) => {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
                done();
            });
        });

        test('Should throw an error when awaited and the ms parameter is zero', async () => {
            try {
                await helpers.sleepAsync(0);
            } catch (err) {
                assert.deepEqual(err.message, invalidParamErrorMessage);
                assert.isFalse(setTimeoutStub.called);
            }
        });

        test('Should resolve the promise and call setTimeout with the specified amount of milliseconds', (done: () => void) => {
            helpers.sleepAsync(ms).then(() => {
                assert.isTrue(setTimeoutStub.called);
                assert.deepEqual(setTimeoutStub.firstCall.args[1], ms);
                done();
            });
        });

        test('Should call setTimeout with the specified amount of ms when the ms parameter is valid', async () => {
            try {
                await helpers.sleepAsync(ms);
                assert.isTrue(setTimeoutStub.called);
                assert.deepEqual(setTimeoutStub.firstCall.args[1], ms);
            } catch (err) {
                assert.isTrue(false);
            }
        });
    });
});