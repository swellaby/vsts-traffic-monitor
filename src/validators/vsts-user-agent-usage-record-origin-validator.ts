'use strict';

import IUsageRecordOriginValidator = require('./../interfaces/usage-record-origin-validator');
import vstsConstants = require('./../vsts-constants');
import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Implementation of the @see {@link IUsageRecordOriginValidator} that uses
 * the known UserAgent patterns associated with the VSTS ecosystem to provide usageRecord
 * origin validation.
 *
 * @class VstsUserAgentUsageRecordOriginValidator
 * @implements {IUsageRecordOriginValidator}
 */
class VstsUserAgentUsageRecordOriginValidator implements IUsageRecordOriginValidator {
    /**
     * Determines whether or not the specfied usageRecord @see {@link VstsUsageRecord} originated
     * from an internal VSTS service-to-service API call.
     *
     * @param {VstsUsageRecord} usageRecord - The usageRecord to review
     * @returns {boolean}
     * @memberof IUsageRecordOriginValidator
     */
    public isInternalVstsServiceToServiceCallOrigin(usageRecord: VstsUsageRecord): boolean {
        if (!usageRecord) {
            throw new Error('Invalid parameter. Must specify a valid usageRecord');
        }

        if (usageRecord.userAgent && usageRecord.userAgent.indexOf(vstsConstants.userAgentPrefixValueForServiceToServiceCall) === 0) {
            return true;
        }

        return false;
    }
}

export = VstsUserAgentUsageRecordOriginValidator;