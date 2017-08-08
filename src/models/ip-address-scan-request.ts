'use strict';

import VstsUsageScanRequest = require('./vsts-usage-scan-request');

/**
 *
 *
 * @class IpAddressScanRequest
 * @extends {VstsUsageScanRequest}
 */
class IpAddressScanRequest extends VstsUsageScanRequest {
    public allowedIpRanges: string[];
    public includeInternalVstsServices: boolean;
}

export = IpAddressScanRequest;