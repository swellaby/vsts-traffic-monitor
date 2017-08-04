'use strict';

/**
 * Old school factory pattern to provide a little IoC.
 */

import IOutOfRangeIpAddressScannerRule = require('./interfaces/out-of-range-ip-address-scanner-rule');
import IVstsUsageService = require('./interfaces/vsts-usage-service');
import IVstsUserService = require('./interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./scanner-rules/out-of-range-ip-address-rule');
import VstsGraphApiUserService = require('./services/vsts-graph-api-user-service');
import VstsUtilizationApiUsageService = require('./services/vsts-utilization-api-usage-service');

/**
 * Provides a new instance of a @see {@link IVstsUsageService} implementation.
 */
export const getVstsUsageService = (): IVstsUsageService => {
    return new VstsUtilizationApiUsageService();
}

/**
 * Provides a new instance of a @see {@link IVstsUserService} implementation.
 */
export const getVstsUserService = (): IVstsUserService => {
    return new VstsGraphApiUserService();
}

// export const getOutOfRangeIpAddressScannerRule = (): IOutOfRangeIpAddressScannerRule => {
//     return new OutOfRangeIpAddressScannerRule(null, null);
// }