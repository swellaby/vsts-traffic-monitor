'use strict';

import vstsUserOrigin = require('./../enums/vsts-user-origin');
import vstsUsageScanTimePeriod = require('./../enums/vsts-usage-scan-time-period');

/**
 * Contains the result of a scan of the usage records on a VSTS account.
 */
class VstsUsageScanReport {
    public scanPeriod: vstsUsageScanTimePeriod;
    public totalUsageRecordsScanned: number;
    public userOrigin: vstsUserOrigin;
    public numUsersActive: number;
    public numScannerRulesExecuted: number;

    /**
     * Creates an instance of VstsUsageScanReport.
     * @memberof VstsUsageScanReport
     */
    constructor() {
        this.totalUsageRecordsScanned = 0;
        this.numUsersActive = 0;
        this.numScannerRulesExecuted = 0;
    }
}

export = VstsUsageScanReport;