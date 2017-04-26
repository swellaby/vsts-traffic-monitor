'use strict';

import VstsUser = require('./../models/vsts-user');

/**
 * Describes the attributes of the response object returned by the
 * VSTS Graph Users API.
 * @link https://{{account}}.vssps.visualstudio.com/_apis/graph/users
 *
 * @interface IVstsGraphApiUserResponse
 */
interface IVstsGraphApiUserResponse {
    count: number;
    value: VstsUser[];
}

export = IVstsGraphApiUserResponse;