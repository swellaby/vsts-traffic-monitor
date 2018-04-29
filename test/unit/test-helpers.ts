'use strict';

import IOutOfRangeIpAddressScannerRule = require('./../../src/interfaces/out-of-range-ip-address-scanner-rule');
import IpAddressScanRequest = require('./../../src/models/ip-address-scan-request');
import IsoDateRange = require('./../../src/models/iso-date-range');
import IUsageRecordOriginValidator = require('./../../src/interfaces/usage-record-origin-validator');
import IVstsGraphLink = require('./../../src/interfaces/vsts-graph-link');
// import IVstsGraphUsersApiResponse = require('./../../src/interfaces/vsts-graph-api-user-response');
import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
import IVstsUserGraphLinks = require('./../../src/interfaces/vsts-user-graph-links');
import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
import OutOfRangeIpAddressScannerRule = require('./../../src/scanner-rules/out-of-range-ip-address-scanner-rule');
import vstsConstants = require('./../../src/vsts-constants');
import VstsGraphApiUserService = require('./../../src/services/vsts-graph-api-user-service');
import VstsStorageKey = require('./../../src/models/vsts-storage-key');
import VstsUsageRecord = require('./../../src/models/vsts-usage-record');
import VstsUsageScanResult = require('./../../src/models/vsts-usage-scan-result');
import VstsUser = require('./../../src/models/vsts-user');
import VstsUserActivityReport = require('./../../src/models/vsts-user-activity-report');
import VstsUtilizationApiUsageService = require('./../../src/services/vsts-utilization-api-usage-service');

export const emptyString = '';

export const vstsAccountName = 'swellaby';
export const sampleUserDescriptor = 'aad.AbCDeFc0OWQtOTM2YS03YmMzLTg5Y2YtNjZhZjBmMzJlNDIx';
export const sampleStorageKeyUrl = 'https://' + vstsAccountName + '.visualstudio.com/_apis/graph/storagekeys/' + sampleUserDescriptor;

const aadOrigin = 'aad';
const vstsOrigin = 'vsts';
export const sampleGuid = '626c88e3-1e13-4663-abdc-5658b0757b80';
export const invalidGuid = 'NOgood';

const storageKeyLink: IVstsGraphLink = {
    href: sampleStorageKeyUrl
};

const graphLinks: IVstsUserGraphLinks = <IVstsUserGraphLinks> {
    storageKey: storageKeyLink
};

const storageKey: VstsStorageKey = new VstsStorageKey();
storageKey.value = sampleGuid;
export const sampleStorageKey = storageKey;
export const storageKeyApiJson = JSON.stringify(storageKey);

/**
 * Helper function that performs a discrete Fourier transform... just kidding.
 * @param displayName
 * @param origin
 */
export const buildVstsUser = (displayName: string, origin: string): VstsUser => {
    const user = new VstsUser();
    user.displayName = displayName;
    user.origin = origin;
    user.storageKey = storageKey;
    return user;
};

const aadUserCaleb = buildVstsUser('caleb', aadOrigin);
const aadUserBailey = buildVstsUser('bailey', aadOrigin);
const aadUserNorm = buildVstsUser('norm', aadOrigin);

const vstsUserRuchi = buildVstsUser('ruchi', vstsOrigin);
const vstsUserSally = buildVstsUser('sally', vstsOrigin);
const vstsUserTravis = buildVstsUser('travis', vstsOrigin);
const vstsUserAdmin = buildVstsUser('admin', vstsOrigin);

const linksUser = buildVstsUser('links', aadOrigin);
linksUser._links = graphLinks;
export const graphLinksUser = linksUser;

export const allAADOriginUsers: VstsUser[] = [ aadUserCaleb, aadUserBailey, aadUserNorm ];
export const allVstsOriginUsers: VstsUser[] = [ vstsUserRuchi, vstsUserSally, vstsUserTravis, vstsUserAdmin ];
export const mixedOriginUsers: VstsUser[] = allAADOriginUsers.concat(allVstsOriginUsers);
export const mixedOriginVstsGraphUsersApiJson = JSON.stringify({
    count: mixedOriginUsers.length,
    value: mixedOriginUsers
});

export const allAddOriginVstsGraphUsersApiJson = JSON.stringify({
    count: allAADOriginUsers.length,
    value: allAADOriginUsers
});

export const allVstsOriginUsersGraphUsersApiJson = JSON.stringify({
    count: allVstsOriginUsers.length,
    value: allVstsOriginUsers
});

/**
 * Helper function to build the response object provided to the Request module's
 * callback function on get and post requests.
 * @param httpStatusCode
 */
const buildResponseObject = (httpStatusCode: number) => {
    return {
        statusCode: httpStatusCode,
        headers: {}
    };
};

export const invalidJson = '{[]';
export const http200Response = buildResponseObject(200);
export const http400Response = buildResponseObject(400);
export const http401Response = buildResponseObject(401);
export const http403Response = buildResponseObject(403);
export const http404Response = buildResponseObject(404);
export const http409Response = buildResponseObject(409);

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

export const firstUsageRecord: VstsUsageRecord = <VstsUsageRecord> {
    application: 'Web Access',
    command: 'Account.Home',
    count: 2,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: firstValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'Mozilla something',
    authenticationMechanism: 'FedAuth',
    user: aadUserCaleb.displayName,
    vsid: aadUserCaleb.storageKey.value
};

export const secondUsageRecord: VstsUsageRecord = <VstsUsageRecord> {
    application: 'Framework',
    command: 'Projects.GetProjects',
    count: 3,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: secondValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'Mozilla/5.0',
    authenticationMechanism: 'Pat',
    user: aadUserBailey.displayName,
    vsid: aadUserBailey.storageKey.value
};

export const usageRecords: VstsUsageRecord[] = [ firstUsageRecord, secondUsageRecord ];
export const usageRecordsJson = JSON.stringify({
  count: usageRecords.length,
  value: usageRecords
});

export const emptyUsageRecords: VstsUsageRecord[] = [];

const activeCalebVstsUser = new VstsUser();
activeCalebVstsUser.displayName = aadUserCaleb.displayName;
activeCalebVstsUser.storageKey = <VstsStorageKey> { value: sampleGuid };
const activeBaileyVstsUser = new VstsUser();
activeBaileyVstsUser.displayName = aadUserBailey.displayName;
activeBaileyVstsUser.storageKey = <VstsStorageKey> { value: sampleGuid };

export const activeVstsUsersFromUsageRecords: VstsUser[] = [ activeCalebVstsUser, activeBaileyVstsUser ];

export const nullIpUsageRecord: VstsUsageRecord = <VstsUsageRecord> {
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

export const internalVstsServiceUsageRecord: VstsUsageRecord = <VstsUsageRecord> {
    application: 'Framework',
    command: 'Projects.GetProjects',
    count: 3,
    delay: 0,
    endTime: isoFormatEndTime,
    ipAddress: thirdValidIpAddress,
    startTime: isoFormatStartTime,
    usage: 1,
    userAgent: 'VSServices/15.119.26629.2 (w3wp.exe) (Service=vsspsextprodch1su1)',
    authenticationMechanism: vstsConstants.authMechanismValueForServiceToServiceCall
};

/**
 * Helper function for creating some stub validators.
 */
const createUsageRecordOriginValidatorStub = (): IUsageRecordOriginValidator => {
    return <IUsageRecordOriginValidator> {
        isInternalVstsServiceToServiceCallOrigin: (): boolean => { return true; }
    };
};

export const usageRecordOriginValidators: IUsageRecordOriginValidator[] = [
    createUsageRecordOriginValidatorStub(),
    createUsageRecordOriginValidatorStub()
];

export const buildOutOfRangeIpAddressScannerRule = (): IOutOfRangeIpAddressScannerRule => {
    return new OutOfRangeIpAddressScannerRule(allowedIpRanges, false, usageRecordOriginValidators);
};

export const buildUsageServiceInstance = (): IVstsUsageService => {
    return new VstsUtilizationApiUsageService();
};

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

export const continuationToken = 'asdklfhasdi7ftasid7ft6audf8iw873rrykuUGSAgfFASDG079087fgfkasdUinfoFYYKSDFPOJ234986234MFFNSDO2348ur9SDAFHhj23nfFOHENCCMNWO';
export const sampleUsageSummaryApiUrl = 'https://awesomeness.visualstudio.com/_apis/utilization/usagesummary';