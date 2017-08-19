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
};

/**
 * Returns a @see {@link IsoDateRange} instance with start and end times
 * that represent the specified day.
 *
 * @param {moment.Moment} day - The target day to use for the ISO range.
 * @returns {IsoDateRange} - The UTC date range of the specified day.
 */
const getFullDayIsoDateRange = (day: moment.Moment): IsoDateRange => {
    const startTime = day.startOf(momentDay).format();
    const endTime = day.endOf(momentDay).format();

    return new IsoDateRange(startTime, endTime);
};

/**
 * Returns a UTC based @see {@link IsoDateRange} instance with ISO formatted
 * start and end times that cover the specified target date.
 *
 * @param {Date} targetDate - The target date to build a UTC based ISO Date Range.
 * @throws {InvalidArgumentException} Will throw an error if the account name is null, undefined,
 * or does not match the VSTS account naming standards.
 * @returns {IsoDateRange} - The UTC date range of the target day.
 */
export const buildUtcIsoDateRange = (targetDate: Date): IsoDateRange => {
    if (!targetDate) {
        throw new Error('Invalid date specified.');
    }

    const utcDate = moment(targetDate).utc();
    return getFullDayIsoDateRange(utcDate);
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

    return getFullDayIsoDateRange(yesterday);
};

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
};