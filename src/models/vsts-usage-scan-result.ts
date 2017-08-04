'use strict';

import VstsUsageRecord = require('./vsts-usage-record');

/**
 * Represents the result of a scan of @see {@link VstsUsageRecord }
 *
 * @class VstsUsageScanResult
 */
class VstsUsageScanResult {
    public scannedRecordCount: number;
    public containsMatchedRecords: boolean;
    public containsRecordScanErrors: boolean;
    public matchedRecords: VstsUsageRecord[] = [];
    public recordScanErrorMessages: string[] = [];
    public erroredScanRecords: VstsUsageRecord[] = [];

    /**
     * Creates an instance of VstsUsageScanResult.
     * @memberof VstsUsageScanResult
     */
    constructor() {
        this.scannedRecordCount = 0;
        this.containsMatchedRecords = false;
        this.containsRecordScanErrors = false;
    }
}

export = VstsUsageScanResult;