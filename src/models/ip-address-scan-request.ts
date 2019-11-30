'use strict';

import AuthMechanism = require('../enums/auth-mechanism');
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
    public targetAuthMechanism: AuthMechanism;
}

export = IpAddressScanRequest;
