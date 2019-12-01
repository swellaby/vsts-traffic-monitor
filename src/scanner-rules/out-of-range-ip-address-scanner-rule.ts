'use strict';

import IpAddressScanRequest = require('../models/ip-address-scan-request');
import IOutOfRangeIpAddressScannerRule = require('./../interfaces/out-of-range-ip-address-scanner-rule');
import IUsageRecordOriginValidator = require('./../interfaces/usage-record-origin-validator');
import vstsHelpers = require('./../vsts-helpers');
import VstsUsageRecord = require('./../models/vsts-usage-record');
import AuthMechanism = require('../enums/auth-mechanism');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.

/**
 * Implementation of the @see {@link IOutOfRangeIpAddressScannerRule} interface
 * that uses the range_check library.
 *
 * @class OutOfRangeIpAddressScannerRule
 * @implements {IOutOfRangeIpAddressScannerRule}
 */
class OutOfRangeIpAddressScannerRule implements IOutOfRangeIpAddressScannerRule {
    private scanRequest: IpAddressScanRequest;
    private usageRecordOriginValidators: IUsageRecordOriginValidator[];

    /**
     * Creates a new instance
     *
     * @param {string[]} allowedIpRanges
     * @memberof OutOfRangeIpAddressScannerRule
     *
     * @throws {Error} - Will throw an error on invalid input.
     */
    constructor (
        scanRequest: IpAddressScanRequest,
        usageRecordOriginValidators?: IUsageRecordOriginValidator[]
    ) {
        if (!scanRequest || !usageRecordOriginValidators) {
            throw new Error('Invalid constructor parameters. scanRequest and usageRecordOriginValidators must be specified');
        }

        const { allowedIpRanges } = scanRequest;

        if (!allowedIpRanges || allowedIpRanges.length === 0) {
            throw new Error('Invalid constructor parameters. allowedIpRanges parameter must be a non-empty array of valid values.');
        }

        this.validateIpRangeValues(allowedIpRanges);

        this.scanRequest = scanRequest;
        this.usageRecordOriginValidators = usageRecordOriginValidators;
    }

    /**
     * Scans the specified VSTS Usage Record to determine if the record matches
     * a condition identified by the ScannerRule implementation.
     *
     * @description This rule is determining whether the IP Address of the usage record falls
     * outside the expected list of IP Addresses and/or Ranges.
     *
     * @param {VstsUsageRecord} usageRecord
     * @memberof IScannerRule
     *
     * @throws {Error} - Will throw an error on invalid input.
     * @returns {boolean} - True if the specified Usage Record came from an out of range IP Address that
     * does not fall within the specified list of expected addresses and/or ranges.
     */
    public scanRecordForMatch(usageRecord: VstsUsageRecord): boolean {
        if (!usageRecord) {
            throw new Error('Invalid parameter. usageRecord cannot be null nor undefined');
        }
        const { allowedIpRanges, includeInternalVstsServices, targetAuthMechanism } = this.scanRequest;

        const { ipAddress, authenticationMechanism } = usageRecord;
        if (ipAddress && !ipRangeHelper.inRange(ipAddress, allowedIpRanges)) {
            // This usageRecord came from an IP outside the expected range. Check to see if it was created by VSTS itself before flagging it.
            switch (targetAuthMechanism) {
                case AuthMechanism.any: break;
                case AuthMechanism.pat:
                    if (!authenticationMechanism.toLowerCase().startsWith('pat')) {
                        return false;
                    }

            }

            if (vstsHelpers.isInternalVstsServiceToServiceCall(usageRecord, this.usageRecordOriginValidators)) {
            // if (usageRecord.userAgent.indexOf('VSServices') === 0) {
                if (includeInternalVstsServices) {
                    return true;
                }
           } else {
               return true;
           }
        }

        return false;
    }

    /**
     * Validates that the specified values are each a valid IPv4 address or CIDR block.
     *
     * @private
     * @param {string[]} ipRanges
     * @memberof OutOfRangeIpAddressScannerRule
     */
    private validateIpRangeValues(ipRanges: string[]): void {
        ipRanges.forEach(ip => {
            if (!ipRangeHelper.isIP(ip) && !ipRangeHelper.isRange(ip)) {
                throw new Error('Specified allowedIpRanges contains one or more invalid values. All values must be a valid IPv4 or ' +
                    'IPv6 address, or a valid CIDR block');
            }
        });
    }
}

export = OutOfRangeIpAddressScannerRule;
