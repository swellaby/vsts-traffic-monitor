'use strict';

import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Describes the capabilities of a scanner rule.
 *
 * @interface IScannerRule
 */
interface IScannerRule {
    /**
     *
     *
     * @param {VstsUsageRecord} usageRecord
     * @returns {boolean}
     * @memberof IScannerRule
     */
    flagRecord(usageRecord: VstsUsageRecord): boolean,
}

export = IScannerRule;