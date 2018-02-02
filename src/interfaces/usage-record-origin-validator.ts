'use strict';

import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Represents a validator used to analyze origin properties of a
 * @see {@link VstsUsageRecord}
 *
 * @interface IUsageRecordOriginValidator
 */
interface IUsageRecordOriginValidator {
    /**
     * Determines whether or not the specfied usageRecord @see {@link VstsUsageRecord} originated
     * from an internal VSTS service-to-service API call.
     *
     * @param {VstsUsageRecord} usageRecord - The usageRecord to review
     * @returns {boolean}
     * @memberof IInternalVstsApiCallAttribute
     */
    isInternalVstsServiceToServiceCallOrigin(usageRecord: VstsUsageRecord): boolean;
}

export = IUsageRecordOriginValidator;