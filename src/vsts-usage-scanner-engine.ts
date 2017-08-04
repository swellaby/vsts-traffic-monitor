// 'use strict';

// import IOutOfRangeIpAddressScannerRule = require('./interfaces/out-of-range-ip-address-scanner-rule');
// import IScannerRule = require('./interfaces/scanner-rule');
// import VstsUsageRecord = require('./models/vsts-usage-record');
// import VstsUsageScanResult = require('./models/vsts-usage-scan-result');

// /**
//  * Executes the specified @see {IScannerRule} against each of the VSTS Usage Records
//  *
//  * @param {VstsUsageRecord[]} usageRecords - The VSTS Usage records to scan.
//  * @param {IScannerRule} scannerRule - The rule to use for scanning the usageRecords
//  *
//  * @returns {VstsUsageScanResult} - The result of the scan.
//  */
// const executeScannerRule = (usageRecords: VstsUsageRecord[], scannerRule: IScannerRule): VstsUsageScanResult => {
//     const scanResult = new VstsUsageScanResult();
//     scanResult.scannedRecordCount = usageRecords.length;

//     usageRecords.forEach(record => {
//         try {
//             const isViolation = scannerRule.scanRecordForMatch(record)

//             if (isViolation) {
//                 scanResult.containsFlaggedRecords = true;
//                 scanResult.flaggedRecords.push(record);
//             }
//         } catch (err) {
//             scanResult.containsRecordScanErrors = true;
//             scanResult.recordScanErrorMessages.push(err.message);
//             scanResult.erroredScanRecords.push(record);
//         }
//     });

//     scanResult.scannedRecordCount = usageRecords.length;
//     return scanResult;
// }

// /**
//  * Scans the IP Addresses in the VSTS Usage Records for a single user.
//  *
//  * @param {VstsUsageRecord[]} usageRecords - The VSTS Usage records to scan.
//  * @param {IOutOfRangeIpAddressScannerRule} outOfRangeIpAddressScannerRule - The rule to use for scanning the usageRecords for any
//  * records that originated from an out-of-range IP Address.
//  *
//  * @throws {Error} - Throws an error if either of the parameters are null/undefined.
//  * @returns {VstsUsageScanResult} - The result of the scan.
//  */
// export const scanUserIpAddresses =
//     (usageRecords: VstsUsageRecord[], outOfRangeIpAddressScannerRule: IOutOfRangeIpAddressScannerRule): VstsUsageScanResult => {
//         if (!usageRecords || !outOfRangeIpAddressScannerRule) {
//             throw new Error('Invalid parameters. Must specify valid usageRecords and ipScannerRule.');
//         }

//         if (usageRecords.length === 0) {
//             return new VstsUsageScanResult();
//         }

//         return executeScannerRule(usageRecords, outOfRangeIpAddressScannerRule);
// }

// /**
//  *
//  * @param usageRecords
//  * @param scannerRules
//  */
// // eslint-disable-next-line no-unused-vars
// export const scanRecords = (usageRecords: VstsUsageRecord[], scannerRules: IScannerRule[]) => {
//     throw new Error('Not yet implemented.');
// }