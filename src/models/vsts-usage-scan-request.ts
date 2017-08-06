'use strict';

import vstsUsageScanTimePeriod = require('./../enums/vsts-usage-scan-time-period');
import vstsUserOrigin = require('./../enums/vsts-user-origin');

/**
 * Represents the parameters used for a request to
 * scan usage records on a VSTS account.
 *
 * @class VstsUsageScanRequest
 */
class VstsUsageScanRequest {
   public vstsAccountName: string;
   public vstsAccessToken: string;
   public vstsUserOrigin: vstsUserOrigin;
   public scanTimePeriod: vstsUsageScanTimePeriod;
}

export = VstsUsageScanRequest;