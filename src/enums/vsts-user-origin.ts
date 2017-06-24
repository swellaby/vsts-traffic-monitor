'use strict';

/**
 * Enumerates the possible origins for users in a VSTS account.
 *
 * @enum {number}
 */
enum VstsUserOrigin {
    aad = 0,
    all = 1
}

export = VstsUserOrigin;