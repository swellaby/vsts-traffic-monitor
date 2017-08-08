// 'use strict';

// import Chai = require('chai');
// import Sinon = require('sinon');

// import factory = require('./../../src/factory');
// import IOutOfRangeIpAddressScannerRule = require('./../../src/interfaces/out-of-range-ip-address-scanner-rule');
// import IpAddressScanRequest = require('./../../src/models/ip-address-scan-request');
// import IVstsUsageService = require('./../../src/interfaces/vsts-usage-service');
// import IVstsUserService = require('./../../src/interfaces/vsts-user-service');
// import testHelpers = require('./test-helpers');
// import vstsUsageMonitor = require('./../../src/vsts-usage-monitor');
// import VstsUsageRecord = require('./../../src/models/vsts-usage-record');
// import vstsUsageScannerEngine = require('./../../src/vsts-usage-scanner-engine');
// import vstsUsageScanTimePeriod = require('./../../src/enums/vsts-usage-scan-time-period');
// import vstsUserOrigin = require('./../../src/enums/vsts-user-origin');

// const assert = Chai.assert;

// /**
//  * Contains unit tests for the VSTS Usage Monitor functions
//  * defined in {@link ./src/vsts-usage-monitor.ts}
//  */
// suite('VstsUsageMonitor Suite:', () => {
//     const sandbox = Sinon.sandbox.create();
//     let outOfRangeIpAddressScannerRule: IOutOfRangeIpAddressScannerRule;
//     let vstsUsageService: IVstsUsageService;
//     let vstsUserService: IVstsUserService;
//     // eslint-disable-next-line no-unused-vars
//     let vstsUsageScannerEngineScanUserIpAddressStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let vstsUserServiceGetAADUsersStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let vstsUserServiceGetAllUsersStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let vstsUsageServiceGetUserActivityFromYesterdayStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let vstsUsageServiceGetUserActivityOverLast24Hours: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let factoryGetVstsUsageServiceStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let factoryGetVstsUserServiceStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     let factoryGetOutOfRangeIpAddressScannerRuleStub: Sinon.SinonStub;
//     // eslint-disable-next-line no-unused-vars
//     const userServiceFailedErrorMessage = 'Failed to retrieve the list of users from the specified VSTS account. ' +
//             'Please ensure that the Graph API is enabled on the account.';
//     // eslint-disable-next-line no-unused-vars
//     const invalidUserOriginErrorMessage = 'Unable to retrieve user list from VSTS account. Unknown or unsupported user origin specified.';
//     // eslint-disable-next-line no-unused-vars
//     const debugErrorMessagePrefix = 'Error details: ';
//     // eslint-disable-next-line no-unused-vars
//     const emptyUserListErrorMessage = 'No users were found from the specified User Origin on the specified VSTS account.';
//     // eslint-disable-next-line no-unused-vars
//     const usageServiceFailedErrorMessage = 'Encountered a fatal error while trying to retrieve and analyze usage records for a user. Error details: ';
//     const invalidTimePeriodErrorMessage = 'Unable to retrieve usage records from VSTS. Unrecognized or unsupported time period specified for scan.'
//     const invalidTimePeriodDebugErrorMessageBase = 'Currently the only supported scan intervals are \'priorDay\' and \'last24Hours\'';

//     /**
//      * Helper method to create stubs.
//      */
//     const initializeStubInstances = () => {
//         outOfRangeIpAddressScannerRule = testHelpers.buildOutOfRangeIpAddressScannerRule();
//         vstsUsageService = testHelpers.buildUsageServiceInstance();
//         vstsUserService = testHelpers.buildUserServiceInstance();
//     };

//     /**
//      * Helper method to create stubs.
//      */
//     const setVstsUserServiceStubs = () => {
//         vstsUserServiceGetAADUsersStub = sandbox.stub(vstsUserService, 'getAADUsers').callsFake(() => {
//             return Promise.resolve(testHelpers.allAADOriginUsers);
//         });
//         vstsUserServiceGetAllUsersStub = sandbox.stub(vstsUserService, 'getAllUsers').callsFake(() => {
//             return Promise.resolve(testHelpers.allVstsOriginUsers);
//         });
//     };

//     /**
//      * Helper method to create stubs.
//      */
//     const setVstsUsageServiceStubs = () => {
//         vstsUsageServiceGetUserActivityFromYesterdayStub = sandbox.stub(vstsUsageService, 'getUserActivityFromYesterday').callsFake(() => {
//             return Promise.resolve(testHelpers.usageRecords);
//         });
//         vstsUsageServiceGetUserActivityOverLast24Hours = sandbox.stub(vstsUsageService, 'getUserActivityOverLast24Hours').callsFake(() => {
//             return Promise.resolve(testHelpers.usageRecords);
//         });
//     };

//     /**
//      * Helper method to create stubs.
//      */
//     const setFactoryStubs = () => {
//         factoryGetVstsUsageServiceStub = sandbox.stub(factory, 'getVstsUsageService').callsFake(() => {
//             return vstsUsageService;
//         });
//         factoryGetVstsUserServiceStub = sandbox.stub(factory, 'getVstsUserService').callsFake(() => {
//             return vstsUserService;
//         });
//         factoryGetOutOfRangeIpAddressScannerRuleStub =
//             sandbox.stub(factory, 'getOutOfRangeIpAddressScannerRule').callsFake(() => {
//                 return outOfRangeIpAddressScannerRule;
//             });
//     };

//     setup(() => {
//         initializeStubInstances();
//         setVstsUserServiceStubs();
//         setVstsUsageServiceStubs();
//         setFactoryStubs();
//         vstsUsageScannerEngineScanUserIpAddressStub = sandbox.stub(vstsUsageScannerEngine, 'scanUserIpAddresses').callsFake(() => {
//             return;
//         });
//     });

//     teardown(() => {
//         sandbox.restore();
//         outOfRangeIpAddressScannerRule = null;
//         vstsUsageService = null;
//         vstsUserService = null;
//     });

//     // eslint-disable-next-line max-statements
//     suite('scanForOutOfRangeIpAddresses Suite:', () => {
//         const invalidParamsErrorMessage = 'Invalid scan request parameters. Unable to execute scan for out of range Ip Addresses.';
//         let ipAddressScanRequest: IpAddressScanRequest;

//         setup(() => {
//             ipAddressScanRequest = testHelpers.getDefaultIpAddressScanRequest();
//             ipAddressScanRequest.vstsAccountName = testHelpers.vstsAccountName;
//             ipAddressScanRequest.vstsUserOrigin = vstsUserOrigin.aad;
//             ipAddressScanRequest.scanTimePeriod = vstsUsageScanTimePeriod.last24Hours;
//         });

//         teardown(() => {
//             ipAddressScanRequest = null;
//         });

//         suite('Scan request parameters validation Suite:', () => {
//             test('Should throw an error when scanRequest param is null', async () => {
//                 try {
//                     await vstsUsageMonitor.scanForOutOfRangeIpAddresses(null);
//                     assert.isTrue(false);
//                 } catch (err) {
//                     assert.deepEqual(err.message, invalidParamsErrorMessage);
//                 }
//             });

//             test('Should throw an error when scanRequest param is undefined', async () => {
//                 try {
//                     await vstsUsageMonitor.scanForOutOfRangeIpAddresses(undefined);
//                     assert.isTrue(false);
//                 } catch (err) {
//                     assert.deepEqual(err.message, invalidParamsErrorMessage);
//                 }
//             });

//             test('Should return a failed result when unsupported VSTS User origin is specified', async () => {
//                 ipAddressScanRequest.vstsUserOrigin = undefined;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.isFalse(vstsUserServiceGetAADUsersStub.called);
//                 assert.isFalse(vstsUserServiceGetAllUsersStub.called);
//                 assert.isFalse(factoryGetVstsUsageServiceStub.called);
//                 assert.deepEqual(scanReport.errorMessage, userServiceFailedErrorMessage);
//                 assert.deepEqual(scanReport.debugErrorMessage, debugErrorMessagePrefix + invalidUserOriginErrorMessage);
//             });

//             test('Should contain request info fields on a user origin error', async () => {
//                 ipAddressScanRequest.vstsUserOrigin = undefined;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.deepEqual(scanReport.vstsAccountName, testHelpers.vstsAccountName);
//                 assert.deepEqual(scanReport.scanPeriod, vstsUsageScanTimePeriod.last24Hours);
//             });

//             test('Should retrieve AAD origin users when specified', async () => {
//                 vstsUserServiceGetAADUsersStub.callsFake(() => {
//                     return Promise.reject(new Error());
//                 });

//                 ipAddressScanRequest.vstsUserOrigin = vstsUserOrigin.aad;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.isTrue(vstsUserServiceGetAADUsersStub.called);
//                 assert.isFalse(vstsUserServiceGetAllUsersStub.called);
//                 assert.isFalse(factoryGetVstsUsageServiceStub.called);
//                 assert.deepEqual(scanReport.errorMessage, userServiceFailedErrorMessage);
//             });

//             test('Should retrieve all origin users when specified', async () => {
//                 vstsUserServiceGetAllUsersStub.callsFake(() => {
//                     return Promise.reject(new Error());
//                 });

//                 ipAddressScanRequest.vstsUserOrigin = vstsUserOrigin.all;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.isFalse(vstsUserServiceGetAADUsersStub.called);
//                 assert.isTrue(vstsUserServiceGetAllUsersStub.called);
//                 assert.isFalse(factoryGetVstsUsageServiceStub.called);
//                 assert.deepEqual(scanReport.errorMessage, userServiceFailedErrorMessage);
//             });

//             test('Should return correct error message when user retrieval service fails', async () => {
//                 const internalUserServiceErrorMessage = 'oops';
//                 vstsUserServiceGetAllUsersStub.callsFake(() => {
//                     return Promise.reject(new Error(internalUserServiceErrorMessage));
//                 });

//                 ipAddressScanRequest.vstsUserOrigin = vstsUserOrigin.all;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.deepEqual(scanReport.errorMessage, userServiceFailedErrorMessage);
//                 assert.deepEqual(scanReport.debugErrorMessage, debugErrorMessagePrefix + internalUserServiceErrorMessage);
//                 assert.deepEqual(scanReport.vstsAccountName, testHelpers.vstsAccountName);
//                 assert.deepEqual(scanReport.scanPeriod, vstsUsageScanTimePeriod.last24Hours);
//                 assert.deepEqual(scanReport.userOrigin, vstsUserOrigin.all);
//             });

//             test('Should return correct error message when user retrieval service returns empty collection', async () => {
//                 vstsUserServiceGetAADUsersStub.callsFake(() => {
//                     return Promise.resolve([]);
//                 });

//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.deepEqual(scanReport.errorMessage, emptyUserListErrorMessage);
//                 assert.deepEqual(scanReport.vstsAccountName, testHelpers.vstsAccountName);
//                 assert.deepEqual(scanReport.scanPeriod, vstsUsageScanTimePeriod.last24Hours);
//                 assert.deepEqual(scanReport.userOrigin, vstsUserOrigin.aad);
//             });

//             test('Should return failed result when unsupported scan time period is specified', async () => {
//                 ipAddressScanRequest.scanTimePeriod = undefined;
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isFalse(scanReport.completedSuccessfully);
//                 assert.isFalse(factoryGetVstsUsageServiceStub.called);
//                 assert.deepEqual(scanReport.errorMessage, invalidTimePeriodErrorMessage);
//                 assert.deepEqual(scanReport.debugErrorMessage, invalidTimePeriodDebugErrorMessageBase);
//                 assert.deepEqual(scanReport.vstsAccountName, testHelpers.vstsAccountName);
//                 assert.deepEqual(scanReport.scanPeriod, undefined);
//                 assert.deepEqual(scanReport.userOrigin, vstsUserOrigin.aad);
//             });
//         });

//         suite('last24Hours scan period Suite:', () => {
//             test('Should return empty when no usage records are returned', async () => {
//                 vstsUsageServiceGetUserActivityOverLast24Hours.callsFake(() => {
//                     return testHelpers.emptyUsageRecords;
//                 });
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isTrue(scanReport.completedSuccessfully);
//                 assert.isTrue(factoryGetVstsUsageServiceStub.called);
//                 assert.deepEqual(scanReport.errorMessage, undefined);
//                 assert.deepEqual(scanReport.debugErrorMessage, undefined);
//                 assert.deepEqual(scanReport.vstsAccountName, testHelpers.vstsAccountName);
//                 assert.deepEqual(scanReport.scanPeriod, vstsUsageScanTimePeriod.last24Hours);
//                 assert.deepEqual(scanReport.userOrigin, vstsUserOrigin.aad);
//             });

//             // Need all of these assertions (11 statements) to validate that the total report is correct even if an
//             // error occurs during retrival/scan of a single user.
//             // eslint-disable-next-line max-statements
//             test('Should return correct report when an error is encountered during usage retrieval', async () => {
//                 const usageRetrievalErrorMessage = 'usage service crashed';
//                 vstsUsageServiceGetUserActivityOverLast24Hours.onFirstCall().callsFake(() => {
//                     throw new Error(usageRetrievalErrorMessage);
//                 });
//                 const scanReport = await vstsUsageMonitor.scanForOutOfRangeIpAddresses(ipAddressScanRequest);
//                 assert.isTrue(scanReport.completedSuccessfully);
//                 assert.deepEqual(scanReport.errorMessage, undefined);
//                 assert.deepEqual(scanReport.debugErrorMessage, undefined);
//                 assert.deepEqual(scanReport.usageRetrievalErrorUsers.length, 1);
//                 assert.deepEqual(scanReport.usageRetrievalErrorUsers[0], testHelpers.allAADOriginUsers[0]);
//                 assert.deepEqual(scanReport.usageRetrievalErrorMessages.length, 1);
//                 assert.deepEqual(scanReport.usageRetrievalErrorMessages[0], usageServiceFailedErrorMessage + usageRetrievalErrorMessage);
//                 assert.deepEqual(scanReport.numUsersActive, 2);
//             });
//         });
//     });
// });