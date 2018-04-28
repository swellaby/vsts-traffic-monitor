'use strict';

import vstsUsageScanTimePeriod = require('./../enums/vsts-usage-scan-time-period');
import VstsUser = require('./vsts-user');
import vstsUserOrigin = require('./../enums/vsts-user-origin');

/**
 * Contains the result of a scan of the usage records on a VSTS account.
 */
class VstsUsageScanReport {
    public completedSuccessfully: boolean;
    public scanPeriod: vstsUsageScanTimePeriod;
    public userOrigin: vstsUserOrigin;
    public totalUsageRecordsScanned: number;
    public numMatchedUsageRecords: number;
    public numUnscannedUsageRecords: number;
    public numUsersActive: number;
    public numScannerRulesExecuted: number;
    public errorMessage: string;
    public debugErrorMessage: string;
    public vstsAccountName: string;
    public vstsUserOrigin: vstsUserOrigin;
    public scanTimePeriod: vstsUsageScanTimePeriod;
    public usageRetrievalErrorUsers: VstsUser[];
    public usageRetrievalErrorMessages: string[];

    /**
     * Creates an instance of VstsUsageScanReport.
     * @memberof VstsUsageScanReport
     */
    constructor() {
        this.totalUsageRecordsScanned = 0;
        this.numMatchedUsageRecords = 0;
        this.numUnscannedUsageRecords = 0;
        this.numUsersActive = 0;
        this.numScannerRulesExecuted = 0;
        this.usageRetrievalErrorMessages = [];
        this.usageRetrievalErrorUsers = [];
    }
}

export = VstsUsageScanReport;