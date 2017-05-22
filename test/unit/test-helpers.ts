'use strict';

import IsoDateRange = require('./../../src/models/iso-date-range');
import IVstsGraphUsersApiResponse = require('./../../src/interfaces/vsts-graph-api-user-response');
import VstsUser = require('./../../src/models/vsts-user');

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
