'use strict';

import VstsUser = require('./vsts-user');

/**
 * Represents a set of users obtained from the VSTS Graph API.
 * Note that this may only be a subset of the full list of users
 * on a VSTS account. The @property {moreUsersExist} will be true
 * if value in @property {vstsUsers} is only a subset.
 */
class VstsGraphApiUserListResponse {
    /**
     * The list of @see {@link VstsUser[]} users.
     */
    public vstsUsers: VstsUser[] = [];
    /**
     * Indicates whether or not this is a complete set of all the
     * users on the VSTS account, or if this is just a subset and
     * there are more users that remain.
     */
    // tslint:disable-next-line:no-inferrable-types
    public moreUsersExist: boolean = false;
    /**
     * The continuation token to use on subsequent calls to the Graph API
     * to get the additional users.
     */
    public continuationToken: string;
}

export = VstsGraphApiUserListResponse;