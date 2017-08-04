'use strict';

import ScannerRule = require('./scanner-rule');

/**
 * Describes the capabilities of a scanning rule that
 * looks for a VSTS Usage Record that originated from an IP Address
 * that is outside the range of specified allowed addresses and/or ranges.
 *
 * @interface IOutOfRangeIpAddressScannerRule
 * @extends {ScannerRule}
 */
//tslint:disable-next-line:no-empty-interface no-empty-interfaces
interface IOutOfRangeIpAddressScannerRule extends ScannerRule { }

export = IOutOfRangeIpAddressScannerRule;