'use strict';

import VstsUsageRecord = require('./../models/vsts-usage-record');

/**
 * Describes the attributes of the response object returned by the
 * VSTS Utilization Usage Summary API.
 * @link https://{{account}}.visualstudio.com/_apis/Utilization/UsageSummary
 *
 * @interface IVstsUsageSummaryApiResponse
 */
interface IVstsUsageSummaryApiResponse {
    count: number;
    value: VstsUsageRecord[];
}

export = IVstsUsageSummaryApiResponse;