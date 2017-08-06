// 'use strict';

// import factory = require('./factory');
// import IVstsUsageService = require('./interfaces/vsts-usage-service');
// import IVstsUserService = require('./interfaces/vsts-user-service');
// import VstsUsageScanRequest = require('./models/vsts-usage-scan-request');
// import VstsUsageRecord = require('./models/vsts-usage-record');
// import vstsUsageScannerEngine = require('./vsts-usage-scanner-engine');
// import vstsUsageScanTimePeriod = require('./enums/vsts-usage-scan-time-period');
// import VstsUser = require('./models/vsts-user');
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
//         throw new Error('Unable to retrieve user list from VSTS accountname. Unknown or unsupported user origin specified.');
//     }
// };

// /**
//  * Retrieves the VSTS usage records for the specified user.
//  *
//  * @param {VstsUsageScanRequest} scanRequest - The parameters for the scan request.
//  * @param {string} userId - The VSTS id of the user.
//  *
//  * @throws {Error} - Throws an error if an unsupported or unrecognized scan period is specified.
//  * @returns {Promise<VstsVstsUsageRecordUser[]>} - A promise containing the VSTS usage records of the user.
//  */
// const getUsageRecordsForUser = async (scanRequest: VstsUsageScanRequest, userId: string): Promise<VstsUsageRecord[]> => {
//     const scanPeriod: vstsUsageScanTimePeriod = scanRequest.scanTimePeriod;
//     const usageService: IVstsUsageService = factory.getVstsUsageService();
//     const vstsAccountName = scanRequest.vstsAccountName;
//     const accessToken = scanRequest.vstsAccessToken;

//     if (scanPeriod === vstsUsageScanTimePeriod.last24Hours) {
//         return await usageService.getUserActivityOverLast24Hours(userId, vstsAccountName, accessToken);
//     } else if (scanPeriod === vstsUsageScanTimePeriod.priorDay) {
//         return await usageService.getUserActivityFromYesterday(userId, vstsAccountName, accessToken);
//     } else {
//         throw new Error('Unable to retrieve usage records for user. Unrecognized or unsupported time period specified for scan.');
//     }
// };

// export const scanForOutOfRangeIpAddresses = async (scanRequest: VstsUsageScanRequest) => {
//     // error handling?
//     let users: VstsUser[];

//     try {
//         users = await getUsers(scanRequest);
//         users.forEach(async user => {
//             const usageRecords = await getUsageRecordsForUser(scanRequest, user.id);
//             const scanResult = vstsUsageScannerEngine.scanUserIpAddresses(usageRecords, null);
//             // add result info to the response object.
//             console.log(scanResult);
//         });
//     } catch (err) {
//         if (!users) {
//             console.log(err.message);
//         }
//     }
// };