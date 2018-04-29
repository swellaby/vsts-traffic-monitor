'use strict';

/**
 * Represents a usage record in VSTS.
 *
 * @class VstsUsageRecord
 */
class VstsUsageRecord {
    public application: string;
    public command: string;
    public count: number;
    public delay: number;
    /**
     * ISO String Representation in UTC time
     *
     * @type {string}
     * @memberof VstsUsageRecord
     */
    public endTime: string;
    public ipAddress: string;
    /**
     * ISO String Representation in UTC time
     *
     * @type {string}
     * @memberof VstsUsageRecord
     */
    public startTime: string;
    public usage: number;
    public userAgent: string;
    public authenticationMechanism: string;
    public status: string;
    public vsid: string;
    public user: string;
}

export = VstsUsageRecord;