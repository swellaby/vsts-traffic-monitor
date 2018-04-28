'use strict';

import chai = require('chai');

import VstsUser = require('./../../../src/models/vsts-user');

const assert = chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUser} class defined in {@link ./src/models/vsts-user.ts}
 */
suite('VstsUser Suite:', () => {
    let user: VstsUser;

    setup(() => {
        user = new VstsUser();
    });

    teardown(() => {
        user = null;
    });

    test('Should have accessible subjectKind property', () => {
        const subjectKind = 'user';
        user.subjectKind = subjectKind;
        assert.deepEqual(user.subjectKind, subjectKind);
    });

    test('Should have accessible domain property', () => {
        const domain = '1234abcd-a12b-12a1-a123-1ab23456cd78';
        user.domain = domain;
        assert.deepEqual(user.domain, domain);
    });

    test('Should have accessible principalName property', () => {
        const principalName = 'Leslie Knope';
        user.principalName = principalName;
        assert.deepEqual(user.principalName, principalName);
    });

    test('Should have accessible mailAddress property', () => {
        const mailAddress = 'ron.swanson@parksandrec.com';
        user.mailAddress = mailAddress;
        assert.deepEqual(user.mailAddress, mailAddress);
    });

    test('Should have accessible metaTypeId property', () => {
        const metaTypeId = 0;
        user.metaTypeId = metaTypeId;
        assert.deepEqual(user.metaTypeId, metaTypeId);
    });

    test('Should have accessible origin property', () => {
        const origin = 'AAD';
        user.origin = origin;
        assert.deepEqual(user.origin, origin);
    });

    test('Should have accessible originId property', () => {
        const originId = 'abcd1234-a12b-12a1-a123-1ab23456cd78';
        user.originId = originId;
        assert.deepEqual(user.originId, originId);
    });

    test('Should have accessible id property', () => {
        const id = 'abcd1234-1ab2-12a1-a123-1ab23456cd78';
        user.cuid = id;
        assert.deepEqual(user.cuid, id);
    });

    test('Should have accessible displayName property', () => {
        const displayName = 'Burt Macklin';
        user.displayName = displayName;
        assert.deepEqual(user.displayName, displayName);
    });

    test('Should have accessible url property', () => {
        const url = 'https://awesome.visualstudio.com/_apis/graph/users/me';
        user.url = url;
        assert.deepEqual(user.url, url);
    });

    test('Should have accessible descriptor property', () => {
        const descriptor = 'zyxwvutsrqponml';
        user.descriptor = descriptor;
        assert.deepEqual(user.descriptor, descriptor);
    });
});