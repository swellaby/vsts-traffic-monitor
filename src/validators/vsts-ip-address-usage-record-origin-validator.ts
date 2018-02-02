'use strict';

import IUsageRecordOriginValidator = require('./../interfaces/usage-record-origin-validator');
import vstsConstants = require('./../vsts-constants');
import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Implementation of the @see {@link IUsageRecordOriginValidator} that uses
 * the known list of IP addresses associated with the VSTS ecosystem to provide usageRecord
 * origin validation.
 *
 * @class IpAddressAttribute
 * @implements {IpAddressAttribute}
 */
class VstsIpAddressUsageRecordOriginValidator implements IUsageRecordOriginValidator {
    private knownVstsIpAddresses: string[] = [];

    /**
     * Creates an instance of IpAddressAttribute.
     * @memberof IpAddressAttribute
     */
    constructor() {
        this.getKnownVstsIpAddresses();
    }
    /**
     * Determines whether or not the specfied usageRecord @see {@link VstsUsageRecord} originated
     * from an internal VSTS service-to-service API call.
     *
     * @param {VstsUsageRecord} usageRecord - The usageRecord to review
     * @returns {boolean}
     * @memberof IInternalVstsApiCallAttribute
     */
    public isInternalVstsServiceToServiceCallOrigin(usageRecord: VstsUsageRecord): boolean {
        if (!usageRecord) {
            throw new Error('Invalid parameter. Must specify a valid usageRecord');
        }

        return (this.knownVstsIpAddresses.indexOf(usageRecord.ipAddress) > -1) ? true : false;
    }

    /**
     * Retrieves the known list of VSTS IP Addresses.
     *
     * @private
     * @memberof IpAddressAttribute
     */
    private getKnownVstsIpAddresses() {
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressAustraliaEast);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressBrazilSouth);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressCanadaCentral);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressCentralUS);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressEastAsia);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressIndiaSouth);
        this.knownVstsIpAddresses.push(vstsConstants.ipAddressWestEurope);
    }
}

export = VstsIpAddressUsageRecordOriginValidator;