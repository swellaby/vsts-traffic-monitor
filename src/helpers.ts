'use strict';

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