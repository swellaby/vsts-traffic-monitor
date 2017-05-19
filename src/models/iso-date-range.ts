'use strict';

import helpers = require('./../helpers');

/**
 * Represents a date range with ISO Formatted
 * Start and End time strings.
 *
 * @class IsoDateRange
 */
class IsoDateRange {
    /**
     * Creates an instance of IsoDateRange.
     * @param {string} isoStartTime
     * @param {string} isoEndTime
     * @throws {InvalidArgumentException} - Will throw an error if either of the inputs are not in a valid ISO Date format.
     * @memberof IsoDateRange
     */
    constructor(public isoStartTime: string, public isoEndTime: string) {
        if (!helpers.isValidIsoFormat(isoStartTime) || !helpers.isValidIsoFormat(isoEndTime)) {
            throw new Error('Invalid constructor inputs. Both start and end time must be valid ISO strings.');
        }
    }
}

export = IsoDateRange;