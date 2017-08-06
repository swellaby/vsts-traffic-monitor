'use strict';

/**
 * Enumerates the supported time period types of a scan of VSTS account.
 *
 * @enum {number}
 */
enum VstsUsageScanTimePeriod {
    /**
     * The entirety of yesterday.
     */
    priorDay = 0,
    /**
     * The preceeding 24 hours.
     */
    last24Hours = 1
}

export = VstsUsageScanTimePeriod;