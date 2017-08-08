'use strict';

import VstsUsageRecord = require('./vsts-usage-record');
import VstsUser = require('./vsts-user');

/**
 * Represents a report of a user's activity on a VSTS account.
 *
 * @class VstsUserActivityReport
 */
class VstsUserActivityReport {
    public user: VstsUser;
    public allUsageRecords: VstsUsageRecord[];
    public matchedUsageRecords: VstsUsageRecord[];
    public erroredScanUsageRecords: VstsUsageRecord[];

    /**
     * Creates an instance of VstsUserActivityReport.
     * @memberof VstsUserActivityReport
     */
    constructor() {
        this.allUsageRecords = [];
        this.matchedUsageRecords = [];
        this.erroredScanUsageRecords = [];
    }
}

export = VstsUserActivityReport;