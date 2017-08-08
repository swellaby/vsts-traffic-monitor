// 'use strict';

// import factory = require('./factory');
// import helpers = require('./helpers');
// import IOutOfRangeIpAddressScannerRule = require('./interfaces/out-of-range-ip-address-scanner-rule');
// import IpAddressScanRequest = require('./models/ip-address-scan-request');
// import IpAddressScanReport = require('./models/ip-address-scan-report');
// import IVstsUsageService = require('./interfaces/vsts-usage-service');
// import IVstsUserService = require('./interfaces/vsts-user-service');
// import VstsUsageScanRequest = require('./models/vsts-usage-scan-request');
// import VstsUsageRecord = require('./models/vsts-usage-record');
// import vstsUsageScannerEngine = require('./vsts-usage-scanner-engine');
// import VstsUsageScanReport = require('./models/vsts-usage-scan-report');
// import VstsUsageScanResult = require('./models/vsts-usage-scan-result');
// import vstsUsageScanTimePeriod = require('./enums/vsts-usage-scan-time-period');
// import VstsUser = require('./models/vsts-user');
// import VstsUserActivityReport = require('./models/vsts-user-activity-report');
// import vstsUserOrigin = require('./enums/vsts-user-origin');

// /**
//  * Retrieves the set of users from the specified VSTS account.
//  *
//  * @param {VstsUsageScanRequest} scanRequest - The parameters for the scan request.
//  *
//  * @throws {Error} - Throws an error if an unsupported or unrecognized VSTS user origin is specified.
//  * @returns {Promise<VstsUser[]>} - A promise containing the list of users of the VSTS account.
//  */
// const getUsers = async (scanRequest: VstsUsageScanRequest): Promise<VstsUser[]> => {
//     const userService: IVstsUserService = factory.getVstsUserService();

//     const vstsAccountName = scanRequest.vstsAccountName;
//     const accessToken = scanRequest.vstsAccessToken;
//     const userOrigin: vstsUserOrigin = scanRequest.vstsUserOrigin;

//     if (userOrigin === vstsUserOrigin.aad) {
//         return await userService.getAADUsers(vstsAccountName, accessToken);
//     } else if (userOrigin === vstsUserOrigin.all) {
//         return await userService.getAllUsers(vstsAccountName, accessToken);
//     } else {
//         throw new Error('Unable to retrieve user list from VSTS account. Unknown or unsupported user origin specified.');
//     }
// };

// /**
//  * Helper method to ensure the scan report object contains basic information about the scan such as
//  * the VSTS account name, the user origin, and the scan time period.
//  *
//  * @param {VstsUsageScanRequest} request - The original scan request object.
//  * @param {VstsUsageScanReport} report - The resulting scan report that needs fields updated.
//  */
// const setInfoFieldsOnScanReport = (request: VstsUsageScanRequest, report: VstsUsageScanReport) => {
//     report.vstsAccountName = request.vstsAccountName;
//     report.userOrigin = request.vstsUserOrigin;
//     report.scanPeriod = request.scanTimePeriod;
// }

// /**
//  * Reviews the result of the scanned records and adds them to the final report.
//  *
//  * @param {VstsUsageScanResult} scanResult - The result of a particular scan execution.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  * @param {UserActivityReport} userActivityReport - The activity report of the specified user.
//  */
// const analyzeOutOfRangeIpAddressScanResult =
//     (scanResult: VstsUsageScanResult, scanReport: IpAddressScanReport, userActivityReport: VstsUserActivityReport) => {
//     userActivityReport.matchedUsageRecords = scanResult.matchedRecords;
//     userActivityReport.erroredScanUsageRecords = scanResult.erroredScanRecords;

//     if (scanResult.matchedRecords.length > 0) {
//         scanReport.flaggedUserActivityReports.push(userActivityReport);
//         scanReport.numOutOfRangeIpAddressRecords += 1;
//         scanReport.numMatchedUsageRecords += 1;
//         scanReport.numUsersWithFlaggedRecords += 1;
//     }

//     scanReport.userActivityReports.push(userActivityReport);
// }

// /**
//  * Scans the specified usage records according to the requested scan parameters.
//  *
//  * @param {VstsUser} user - The user to scan.
//  * @param {VstsUsageRecord[]} usageRecords - The usage records to scan.
//  * @param {IpAddressScanRequest} scanRequest - The scan request parameters.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  */
// const scanUserUsageRecordsForOutOfRangeIpAddress =
//     (user: VstsUser, usageRecords: VstsUsageRecord[], scanRequest: IpAddressScanRequest, scanReport: IpAddressScanReport) => {
//     const userActivityReport = new VstsUserActivityReport();
//     try {
//         scanReport.numUsersActive += 1;
//         userActivityReport.allUsageRecords = usageRecords;
//         const scannerRule: IOutOfRangeIpAddressScannerRule =
//             factory.getOutOfRangeIpAddressScannerRule(scanRequest.allowedIpRanges, scanRequest.includeInternalVstsServices);
//         const scanResult = vstsUsageScannerEngine.scanUserIpAddresses(usageRecords, scannerRule);
//         analyzeOutOfRangeIpAddressScanResult(scanResult, scanReport, userActivityReport);
//     } catch (err) {
//         console.log(err);
//     }
// };

// /**
//  * Adds the details of the error encountered when trying to retrieve the usage records of the
//  * specified uesr to the final scan report.
//  *
//  * @param {VstsUser} user - The user whose usage records were not retrieved due to the error.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  * @param {Error} error - The error encountered when trying to retrieve the usage records of the user.
//  */
// const addErrorDetailsOnUsageRecordRetrievalFailure = (user: VstsUser, scanReport: VstsUsageScanReport, error: Error) => {
//     scanReport.usageRetrievalErrorUsers.push(user);
//     const baseErrorMessage = 'Encountered a fatal error while trying to retrieve and analyze usage records for a user. Error details: ';
//     scanReport.usageRetrievalErrorMessages.push(helpers.buildError(baseErrorMessage, error).message);
// }

// /**
//  * Sets the values of the IP range fields on the report of the scan.
//  *
//  * @param {IpAddressScanRequest} scanRequest - The scan request parameters.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  */
// const setIpRangeScanFieldsOnReport = (scanRequest: IpAddressScanRequest, scanReport: IpAddressScanReport) => {
//     scanReport.numScannerRulesExecuted = 1;
//     scanReport.allowedIpRanges = scanRequest.allowedIpRanges;
//     setInfoFieldsOnScanReport(scanRequest, scanReport);
// };

// /**
//  * Scans the IP Addresses of the specified user's actions from yesterday.
//  *
//  * @param {VstsUser} user - The user to scan.
//  * @param {IpAddressScanRequest} scanRequest - The scan request parameters.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  */
// const scanIpAddressesFromYesterday = async (user: VstsUser, scanRequest: IpAddressScanRequest, scanReport: IpAddressScanReport ) => {
//     try {
//         const usageService: IVstsUsageService = factory.getVstsUsageService();
//         const vstsAccountName = scanRequest.vstsAccountName;
//         const accessToken = scanRequest.vstsAccessToken;
//         const usageRecords = await usageService.getUserActivityFromYesterday(user.id, vstsAccountName, accessToken);
//         if (usageRecords.length === 0) {
//             return;
//         }
//         scanUserUsageRecordsForOutOfRangeIpAddress(user, usageRecords, scanRequest, scanReport);
//     } catch (err) {
//         addErrorDetailsOnUsageRecordRetrievalFailure(user, scanReport, err);
//     }
//     return null;
// };

// /**
//  * Scans the IP Addresses of the specified user's actions from the last 24 hours.
//  *
//  * @param {VstsUser} user - The user to scan.
//  * @param {IpAddressScanRequest} scanRequest - The scan request parameters.
//  * @param {IpAddressScanReport} scanReport - The report with the results of the scan.
//  */
// const scanUserActivityFromLast24Hours = async (user: VstsUser, scanRequest: IpAddressScanRequest, scanReport: IpAddressScanReport) => {
//     try {
//         const usageService: IVstsUsageService = factory.getVstsUsageService();
//         const vstsAccountName = scanRequest.vstsAccountName;
//         const accessToken = scanRequest.vstsAccessToken;
//         const usageRecords = await usageService.getUserActivityOverLast24Hours(user.id, vstsAccountName, accessToken);
//         if (usageRecords.length === 0) {
//             return;
//         }
//         scanUserUsageRecordsForOutOfRangeIpAddress(user, usageRecords, scanRequest, scanReport);
//     } catch (err) {
//         addErrorDetailsOnUsageRecordRetrievalFailure(user, scanReport, err);
//     }
// }

// /**
//  * Scans the activity of a set of VSTS users for any activities that came from
//  * an IP Address that is outside the allowed set of ranges.
//  *
//  * @param {IpAddressScanRequest} scanRequest - The scan request parameters.
//  * @param {VstsUser[]} users - The list of users to be scanned.
//  *
//  * @returns {Promise<IpAddressScanReport>}
//  */
// const scanUsersActivityForOutOfRangeIpAddresses = async (scanRequest: IpAddressScanRequest, users: VstsUser[]): Promise<IpAddressScanReport> => {
//     const scanReport = new IpAddressScanReport();
//     scanReport.completedSuccessfully = true;

//     if (scanRequest.scanTimePeriod === vstsUsageScanTimePeriod.last24Hours) {
//         await Promise.all(users.map(async user => { await scanUserActivityFromLast24Hours(user, scanRequest, scanReport) }));
//     } else if (scanRequest.scanTimePeriod === vstsUsageScanTimePeriod.priorDay) {
//         await Promise.all(users.map(async user => { await scanIpAddressesFromYesterday(user, scanRequest, scanReport) }));
//     } else {
//         scanReport.completedSuccessfully = false;
//         scanReport.errorMessage = 'Unable to retrieve usage records from VSTS. Unrecognized or unsupported time period specified for scan.';
//         scanReport.debugErrorMessage = 'Currently the only supported scan intervals are \'priorDay\' and \'last24Hours\'';
//     }

//     setIpRangeScanFieldsOnReport(scanRequest, scanReport);
//     return scanReport;
// };

// /**
//  * Builds the report response in instances where the user list from VSTS is empty.
//  *
//  * @param {IpAddressScanRequest} scanRequest - The original scan request object.
//  * @returns {IpAddressScanReport}
//  */
// const buildEmptyUserListScanReport = (scanRequest: IpAddressScanRequest): IpAddressScanReport => {
//     const scanReport = new IpAddressScanReport();
//     scanReport.completedSuccessfully = false;
//     scanReport.errorMessage = 'No users were found from the specified User Origin on the specified VSTS account.';
//     setInfoFieldsOnScanReport(scanRequest, scanReport);

//     return scanReport;
// };

// /**
//  * Builds the scan report object when the list of users were unable to be retrieved due to a fatal error.
//  *
//  * @param {Error} error - The error that was encountered while attempting to retrieve the user list.
//  * @param {IpAddressScanRequest} request - The original request object with scan parameters.
//  *
//  * @returns {IpAddressScanReport}
//  */
// const buildScanReportOnFailedUserRetrieval = (error: Error, request: IpAddressScanRequest): IpAddressScanReport => {
//     const scanReport = new IpAddressScanReport();
//     scanReport.completedSuccessfully = false;
//     scanReport.errorMessage = 'Failed to retrieve the list of users from the specified VSTS account. ' +
//             'Please ensure that the Graph API is enabled on the account.';
//     scanReport.debugErrorMessage = helpers.buildError('Error details: ', error).message;
//     setInfoFieldsOnScanReport(request, scanReport);

//     return scanReport;
// }

// /**
//  * Scans the usage records of the specified VSTS account to determine if any of those records of
//  * user activity came from an IP Address that is outside the range of valid IP Addresses/CIDR blocks.
//  *
//  * @param {IpAddressScanRequest} scanRequest - The parameters required for executing the scan.
//  *
//  * @throws {Error} - Will throw an error if the scanRequest parameter is invalid.
//  * @returns {Promise<IpAddressScanReport>}
//  */
// export const scanForOutOfRangeIpAddresses = async (scanRequest: IpAddressScanRequest): Promise<IpAddressScanReport> => {
//     if (!scanRequest) {
//         throw new Error('Invalid scan request parameters. Unable to execute scan for out of range Ip Addresses.');
//     }

//     try {
//         const users = await getUsers(scanRequest);
//         if (users.length === 0) {
//             return buildEmptyUserListScanReport(scanRequest);
//         }

//         return await scanUsersActivityForOutOfRangeIpAddresses(scanRequest, users);
//     } catch (err) {
//         return buildScanReportOnFailedUserRetrieval(err, scanRequest);
//     }
// };