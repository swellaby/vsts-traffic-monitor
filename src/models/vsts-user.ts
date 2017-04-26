'use strict';

/**
 * Represents a User in VSTS.
 *
 * @class VstsUser
 */
class VstsUser {
    public subjectKind: string;
    public domain: string;
    public principalName: string;
    public mailAddress: string;
    public metaTypeId: number;
    public origin: string;
    public originId: string;
    public id: string;
    public displayName: string;
    public url: string;
    public descriptor: string;
}

export = VstsUser;