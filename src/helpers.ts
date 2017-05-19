'use strict';

import moment = require('moment');
import IsoDateRange = require('./models/iso-date-range');

const momentDay = 'day';
const momentHours = 'hours';

/**
 * Helper function to safely create an explicit Error object with a message since catch block objects
 * cannot be explicitly typed and can be a wide variety of things, including null or undefined.
 *
 * @param {string} baseErrorMessage - The prefix/beginning of the error message that will
 * be applied to the created Error object.
 * @param {any} error - The object from a Catch block.
 *
 * @returns {Error} - An explicit Error object with an aggregated error message.
 */
// tslint:disable-next-line:no-any
export const buildError = (baseErrorMessage: string, error: any): Error => {
    let message = baseErrorMessage;
    if (error) {
        message += error.message;
    }

    return new Error(message);
}

/**
 * Determines whether or not the specified input string is a valid GUID format.
 */
export const isValidGuid = (input: string): boolean => {
    if (!input) {
        return false;
    }

    return new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$').test(input);
};

/**
 * Returns a @see {@link IsoDateRange} object with ISO date formatted strings
 * that encompass the 24 hour range of the preceding day in UTC.
 *
 * @returns {IsoDateRange} - The UTC date range of the preceeding day.
 */
export const getYesterdayUtcDateRange = (): IsoDateRange => {
    const utcNow = moment.utc();
    const yesterday = utcNow.subtract(1, momentDay);
    const startTime = yesterday.startOf(momentDay).format();
    const endTime = yesterday.endOf(momentDay).format();

    return new IsoDateRange(startTime, endTime);
}

/**
 * Returns a @see {@link IsoDateRange} object with ISO date formatted strings
 * that encompass the most recent 24 hour range in UTC.
 *
 * @returns {IsoDateRange} - The UTC date range of the preceeding day.
 */
export const getLast24HoursUtcDateRange = (): IsoDateRange => {
    const utcNow = moment.utc();
    const endTime = utcNow.format();
    const startTime = utcNow.subtract(24, momentHours).format();

    return new IsoDateRange(startTime, endTime);
}

/**
 * Determines whether or not the specified string is in a valid ISO date format.
 * Note that decimal seconds are optional, but no more than 3 decimal points are supported.
 *
 * @param {string} input - The string to validate
 * @returns {booean} - True if the input is a valid ISO string format, otherwise false.
 */
export const isValidIsoFormat = (input: string): boolean => {
    if (!input) {
        return false;
    }

    // For now limiting to no more than 3 decimal places to represent milliseconds.
    return new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T((\\d{2}):(\\d{2}):(\\d{2}))(\\.\\d{1,3})?Z$').test(input);
}