'use strict';

import IOutOfRangeIpAddressScannerRule = require('./../interfaces/out-of-range-ip-address-scanner-rule');
import VstsUsageRecord = require('./../models/vsts-usage-record');

// tslint:disable-next-line:no-var-requires
const ipRangeHelper = require('range_check'); // There is not a typedefinition for this library yet.

/**
 * Implementation of the @see {@link }
 *
 * @class OutOfRangeIpAddressRule
 * @implements {IOutOfRangeIpAddressScannerRule}
 */
class OutOfRangeIpAddressRule implements IOutOfRangeIpAddressScannerRule {
    private validIpRanges: string[];
    private includeInternalVstsServices: boolean;

    /**
     * Creates a new instance
     *
     * @param {string[]} validIpRanges
     * @memberof InvalidIpAddressRule
     *
     * @throws {Error} - Will throw an error on invalid input.
     */
    constructor (validIpRanges: string[], includeInternalVstsServices: boolean) {
        if (!validIpRanges || validIpRanges.length === 0) {
            throw new Error('Invalid constructor parameters. validIpRanges parameter must be a non-empty array of valid values.');
        }

        this.validateIpRangeValues(validIpRanges);

        this.validIpRanges = validIpRanges;
        this.includeInternalVstsServices = includeInternalVstsServices;
    }

    /**
     * Scans the specified VSTS Usage Record to determine if the record matches
     * a condition identified by the ScannerRule implementation.
     *
     * @description This rule is determining whether the IP Address of record falls
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

        const ipAddress = usageRecord.ipAddress;
        if (ipAddress && !ipRangeHelper.inRange(ipAddress, this.validIpRanges)) {
            if (usageRecord.userAgent.indexOf('VSServices') === 0) {
                if (this.includeInternalVstsServices) {
                    return true;
                }
           } else {
               return true;
           }
        }

        return false;
    }

    /**
     *
     *
     * @private
     * @param {string[]} ipRanges
     * @memberof InvalidIpAddressRule
     */
    private validateIpRangeValues(ipRanges: string[]): void {
        ipRanges.forEach(ip => {
            if (!ipRangeHelper.isIP(ip) && !ipRangeHelper.isRange(ip)) {
                throw new Error('Specified validIpRanges contains one or more invalid values. All values must be a valid IPv4 or ' +
                    'IPv6 address, or a valid CIDR block');
            }
        });
    }
}

export = OutOfRangeIpAddressRule;