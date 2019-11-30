'use strict';

/**
 * Enumerates the possible authentication mechanisms for Azure DevOps.
 *
 * @enum {number}
 */
enum AuthMechanism {
    any = 0,
    pat = 1
}

export = AuthMechanism;
