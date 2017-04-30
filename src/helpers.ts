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