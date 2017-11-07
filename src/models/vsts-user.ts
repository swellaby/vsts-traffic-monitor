'use strict';

import IVstsUserGraphLinks = require('./../interfaces/vsts-user-graph-links');
import VstsStorageKey = require('./vsts-storage-key');

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
    public cuid: string;
    public displayName: string;
    public url: string;
    public descriptor: string;
    public storageKey: VstsStorageKey;
    public _links: IVstsUserGraphLinks; // tslint:disable-line:variable-name
}

export = VstsUser;