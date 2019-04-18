'use strict';

/**
 * Determines whether or not the specified input string is a valid GUID format.
 */
export const isValidGuid = (input: string): boolean => {
    if (!input) {
        return false;
    }

    return new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$').test(input);
};

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
};
