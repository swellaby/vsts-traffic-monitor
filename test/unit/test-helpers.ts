'use strict';

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

