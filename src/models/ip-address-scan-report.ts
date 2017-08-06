'use strict';

import VstsUsageScanReport = require('./vsts-usage-scan-report');
import VstsUserActivityReport = require('./vsts-user-activity-report');

/**
 * Represents a report from scanning the IP Addresses of
 * usage records per user on a VSTS account.
 *
 * @class IpAddressScanReport
 */
class IpAddressScanReport extends VstsUsageScanReport {
    public numOutOfRangeIpAddressRecords: number;
    public numUsersWithFlaggedRecords: number;
    public userActivityReports: VstsUserActivityReport[];
    public flaggedUserActivityReports: VstsUserActivityReport[];

    /**
     * Creates an instance of IpAddressScanReport.
     * @memberof IpAddressScanReport
     */
    constructor() {
        super();
        this.numOutOfRangeIpAddressRecords = 0;
        this.numUsersWithFlaggedRecords = 0;
        this.userActivityReports = [];
        this.flaggedUserActivityReports = [];
    }
}

export = IpAddressScanReport;