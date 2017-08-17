'use strict';

import IOutOfRangeIpAddressScannerRule = require('./../../src/interfaces/out-of-range-ip-address-scanner-rule');
import IpAddressScanRequest = require('./../../src/models/ip-address-scan-request');
import IsoDateRange = require('./../../src/models/iso-date-range');
import IVstsGraphUsersApiResponse = require('./../../src/interfaces/vsts-graph-api-user-response');
import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import VstsGraphApiUserService = require('./../../src/services/vsts-graph-api-user-service');
import VstsUsageRecord = require('./../../src/models/vsts-usage-record');
import VstsUsageScanResult = require('./../../src/models/vsts-usage-scan-result');
import VstsUser = require('./../../src/models/vsts-user');
import VstsUserActivityReport = require('./../../src/models/vsts-user-activity-report');
import VstsUtilizationApiUsageService = require('./../../src/services/vsts-utilization-api-usage-service');

export const emptyString = '';

/**
 * Helper function that performs a discrete Fourier transform... just kidding.
 * @param displayName
 * @param origin
 */
const buildVstsUser = (displayName: string, origin: string): VstsUser => {
    const user = new VstsUser();
    user.displayName = displayName;
    user.origin = origin;
    return user;
}

export const vstsAccountName = 'swellaby';

const aadOrigin = 'aad';
const vstsOrigin = 'vsts';

const aadUserCaleb = buildVstsUser('caleb', aadOrigin);
const aadUserBailey = buildVstsUser('bailey', aadOrigin);
const aadUserNorm = buildVstsUser('norm', aadOrigin);

const vstsUserRuchi = buildVstsUser('ruchi', vstsOrigin);
const vstsUserSally = buildVstsUser('sally', vstsOrigin);
const vstsUserTravis = buildVstsUser('travis', vstsOrigin);
const vstsUserAdmin = buildVstsUser('admin', vstsOrigin);

export const allAADOriginUsers: VstsUser[] = [ aadUserCaleb, aadUserBailey, aadUserNorm ];
export const allVstsOriginUsers: VstsUser[] = [ vstsUserRuchi, vstsUserSally, vstsUserTravis, vstsUserAdmin ];
export const mixedOriginUsers: VstsUser[] = allAADOriginUsers.concat(allVstsOriginUsers);
export const mixedOriginVstsGraphUsersApiJson = JSON.stringify({
    count: mixedOriginUsers.length,
    value: mixedOriginUsers
});

/**
 * Helper function to build the response object provided to the Request module's
 * callback function on get and post requests.
 * @param httpStatusCode
 */
const buildResponseObject = (httpStatusCode: number) => {
    return { statusCode: httpStatusCode };
}

export const invalidJson = '{[]';
export const http200Response = buildResponseObject(200);
export const http400Response = buildResponseObject(400);
export const http401Response = buildResponseObject(401);
export const http403Response = buildResponseObject(403);
export const http404Response = buildResponseObject(404);
export const http409Response = buildResponseObject(409);

export const sampleGuid = '626c88e3-1e13-4663-abdc-5658b0757b80';
export const invalidGuid = 'NOgood';
export const invalidIsoFormat = 'nope';
export const isoFormatStartTime = '2017-05-17T17:31:43Z';
export const isoFormatEndTime = '2017-05-18T17:31:43Z';
export const isoFormatNoDecimalString = '2017-04-18T17:31:43Z';
export const isoFormatInvalidDecimalString = '2017-02-09T19:18:12.Z';
export const isoFormatOneDecimalString = '2017-05-18T17:31:43.1Z';
export const isoFormatTwoDecimalsString = '2017-05-12T17:31:43.03Z';
export const isoFormatThreeDecimalsString = '2016-10-31T10:31:43.123Z';
export const isoFormatFourDecimalsString = '2017-08-15T22:31:43.1234Z';

export const validIsoDateRange = new IsoDateRange(isoFormatStartTime, isoFormatEndTime);

export const firstValidIpAddress = '72.123.58.1';
export const secondValidIpAddress = '125.19.23.17';
export const thirdValidIpAddress = '65.52.55.39';
export const fourthValidIpAddress = '192.168.2.0';
export const fifthValidIpAddress = '255.255.255.249';
export const validIpRange = '255.255.255.248/29';
export const allowedIpRanges = [ validIpRange, fourthValidIpAddress ];

export const firstUsageRecord: VstsUsageRecord = {
    application: 'Web Access',
    command: 'Account.Home',
    count: 2,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: firstValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'Mozilla something'
};

export const secondUsageRecord: VstsUsageRecord = {
    application: 'Framework',
    command: 'Projects.GetProjects',
    count: 3,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: secondValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'Mozilla/5.0'
};

export const usageRecords: VstsUsageRecord[] = [ firstUsageRecord, secondUsageRecord ];
export const usageRecordsJson = JSON.stringify({
  count: usageRecords.length,
  value: usageRecords
});

export const emptyUsageRecords: VstsUsageRecord[] = [];

export const nullIpUsageRecord: VstsUsageRecord = {
    application: 'Web Access',
    command: 'Account.Foo',
    count: 1,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: null,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'Mozilla clouds'
};

export const internalVstsServiceUsageRecord: VstsUsageRecord = {
    application: 'Framework',
    command: 'Projects.GetProjects',
    count: 3,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: thirdValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'VSServices/15.119.26629.2 (w3wp.exe) (Service=vsspsextprodch1su1)'
};

export const buildOutOfRangeIpAddressScannerRule = (): IOutOfRangeIpAddressScannerRule => {
    return new OutOfRangeIpAddressScannerRule(allowedIpRanges, false);
};

export const buildUsageServiceInstance = (): IVstsUsageService => {
    return new VstsUtilizationApiUsageService();
}

export const buildUserServiceInstance = (): IVstsUserService => {
    return new VstsGraphApiUserService();
};

export const getDefaultIpAddressScanRequest = (): IpAddressScanRequest => {
    return new IpAddressScanRequest();
};

export const defaultVstsUsageScanResult = new VstsUsageScanResult();

const normFlaggedUserActivityReport = new VstsUserActivityReport();
normFlaggedUserActivityReport.allUsageRecords = usageRecords;
normFlaggedUserActivityReport.user = aadUserNorm;
normFlaggedUserActivityReport.matchedUsageRecords.push(secondUsageRecord);

const baileyFlaggedUserActivityReport = new VstsUserActivityReport();
baileyFlaggedUserActivityReport.allUsageRecords = usageRecords;
baileyFlaggedUserActivityReport.user = aadUserBailey;
baileyFlaggedUserActivityReport.matchedUsageRecords.push(firstUsageRecord);

const calebUserActivityReport = new VstsUserActivityReport();
calebUserActivityReport.allUsageRecords = usageRecords;
calebUserActivityReport.user = aadUserCaleb;

const calebUnscannedActivityReport = new VstsUserActivityReport();
calebUnscannedActivityReport.allUsageRecords = usageRecords;
calebUnscannedActivityReport.user = aadUserCaleb;
calebUnscannedActivityReport.erroredScanUsageRecords.push(firstUsageRecord);
calebUnscannedActivityReport.scanFailureErrorMessages.push('woops');
calebUnscannedActivityReport.scanFailureErrorMessages.push('ouch');

export const firstUserActivityReport = calebUserActivityReport;
export const firstFlaggedUserActivityReport = normFlaggedUserActivityReport;
export const secondFlaggedUserActivityReport = baileyFlaggedUserActivityReport;
export const unscannedUserActivityReport = calebUnscannedActivityReport;

export const flaggedUserActivityReports = [ normFlaggedUserActivityReport, baileyFlaggedUserActivityReport ];