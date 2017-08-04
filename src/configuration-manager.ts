'use strict';

import nconf = require('nconf');

nconf.use('memory');
nconf.env();

const validIpRangesKey = 'validIpRanges';

/**
 * Returns the value of Valid Ip Ranges.
 * @returns {string[]}
 */
export const getValidIpRanges = (): string[] => {
    return nconf.get(validIpRangesKey);
};

/**
 * Sets the value of Valid Ip Ranges.
 * @param {string[]} ranges
 */
export const setValidIpRanges = (ranges: string[]) => {
    nconf.set(validIpRangesKey, ranges);
};
