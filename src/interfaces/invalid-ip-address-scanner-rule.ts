'use strict';

import ScannerRule = require('./scanner-rule');

/**
 * Describes the capabilities of a scanning rule that
 * is focused on the IP addresses of the usage records.
 *
 * @interface IInvalidIpAddressScannerRule
 * @extends {ScannerRule}
 */
//tslint:disable-next-line:no-empty-interface no-empty-interfaces
interface IInvalidIpAddressScannerRule extends ScannerRule { }

export = IInvalidIpAddressScannerRule;