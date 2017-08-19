'use strict';

import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Describes the capabilities of a scanner rule.
 *
 * @interface IScannerRule
 */
interface IScannerRule {
    /**
     * Scans the specified VSTS Usage Record to determine if the record matches
     * a condition identified by the ScannerRule implementation.
     *
     * @param {VstsUsageRecord} usageRecord
     *
     * @memberof IScannerRule
     * @returns {boolean} - Returns true if the record matches the condition of this rule.
     */
    scanRecordForMatch(usageRecord: VstsUsageRecord): boolean;
}

export = IScannerRule;