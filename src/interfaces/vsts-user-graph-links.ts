'use strict';

import IVstsGraphLink = require('./vsts-graph-link');

/**
 * Describes the set of Graph links for a VSTS user.
 *
 * @interface IVstsUserGraphLinks
 */
interface IVstsUserGraphLinks {
    self: IVstsGraphLink;
    memberships: IVstsGraphLink;
    membershipState: IVstsGraphLink;
    storageKey: IVstsGraphLink;
}

export = IVstsUserGraphLinks;