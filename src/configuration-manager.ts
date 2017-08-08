'use strict';

import nconf = require('nconf');

nconf.use('memory');
nconf.env();

const allowedIpRangesKey = 'allowedIpRanges';

/**
 * Returns the value of allowed Ip Ranges.
 * @returns {string[]}
 */
export const getAllowedIpRanges = (): string[] => {
    return nconf.get(allowedIpRangesKey);
};

/**
 * Sets the value of allowed Ip Ranges.
 * @param {string[]} ranges
 */
export const setAllowedIpRanges = (ranges: string[]) => {
    nconf.set(allowedIpRangesKey, ranges);
};
