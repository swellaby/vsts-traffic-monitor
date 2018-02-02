'use strict';

/**
 * Old school factory pattern to provide a little IoC.
 */

import IOutOfRangeIpAddressScannerRule = require('./interfaces/out-of-range-ip-address-scanner-rule');
import IUsageRecordOriginValidator = require('./interfaces/usage-record-origin-validator');
import IVstsUsageService = require('./interfaces/vsts-usage-service');
import IVstsUserService = require('./interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./scanner-rules/out-of-range-ip-address-scanner-rule');
import VstsIpAddressUsageRecordOriginValidator = require('./validators/vsts-ip-address-usage-record-origin-validator');
import VstsGraphApiUserService = require('./services/vsts-graph-api-user-service');
import VstsUtilizationApiUsageService = require('./services/vsts-utilization-api-usage-service');

/**
 * Provides a new instance of a @see {@link IVstsUsageService} implementation.
 *
 * @returns {IVstsUsageService}
 */
export const getVstsUsageService = (): IVstsUsageService => {
    return new VstsUtilizationApiUsageService();
};

/**
 * Provides a new instance of a @see {@link IVstsUserService} implementation.
 *
 * @returns {IVstsUserService}
 */
export const getVstsUserService = (): IVstsUserService => {
    return new VstsGraphApiUserService();
};

/**
 *
 */
export const getUsageRecordOriginValidators = (): IUsageRecordOriginValidator[] => {
    const internalVstsCallAttributes: IUsageRecordOriginValidator[] = [];
    internalVstsCallAttributes.push(new VstsIpAddressUsageRecordOriginValidator());

    return internalVstsCallAttributes;
};

/**
 * Provides a new instance of a @see {@link IOutOfRangeIpAddressScannerRule} implementation.
 *
 * @param {string[]} allowedIpRanges - The allowed set of IP Addresses or ranges.
 * @param {boolean} includeInternalVstsServices - Indicates whether or not usage records from internal VSTS services should be included in the scan.
 *
 * @throws {Error} - Will throw an error if the parameters are invalid.
 * @returns {IOutOfRangeIpAddressScannerRule}
 */
export const getOutOfRangeIpAddressScannerRule =
    (allowedIpRanges: string[], includeInternalVstsServices: boolean): IOutOfRangeIpAddressScannerRule => {
        const usageRecordOriginValidators = getUsageRecordOriginValidators();
        return new OutOfRangeIpAddressScannerRule(allowedIpRanges, includeInternalVstsServices, usageRecordOriginValidators);
};