'use strict';

import Chai = require('chai');

import testHelpers = require('./../test-helpers');
import VstsGraphApiUserListResponse = require('./../../../src/models/vsts-graph-api-user-list-response');

const assert = Chai.assert;

suite('VstsGraphApiUserListResponse Suite:', () => {
    let graphApiUserList: VstsGraphApiUserListResponse;

    setup(() => {
        graphApiUserList = new VstsGraphApiUserListResponse();
    });

    teardown(() => {
        graphApiUserList = null;
    });

    test('Should have accessible property containing users', () => {
        assert.isNotNull(graphApiUserList.vstsUsers);
    });

    test('Should have settable property for containing users', () => {
        graphApiUserList.vstsUsers = testHelpers.allAADOriginUsers;
        assert.deepEqual(testHelpers.allAADOriginUsers, graphApiUserList.vstsUsers);
    });

    test('Should have accessible property for user list status indicator', () => {
        assert.isNotNull(graphApiUserList.moreUsersExist);
    });

    test('Should have settable property for moreUsersExists indicator', () => {
        graphApiUserList.moreUsersExist = true;
        assert.isTrue(graphApiUserList.moreUsersExist);
    });

    test('Should have default value of false on moreUsersExists indicator', () => {
        assert.isFalse(graphApiUserList.moreUsersExist);
    });

    test('Should have accessible property for continuationToken', () => {
        assert.isNotNull(graphApiUserList.continuationToken);
    });

    test('Should have settable property for continuationToken', () => {
        const token = 'asdf982734rhasdfuihuaewrqrv234';
        graphApiUserList.continuationToken = token;
        assert.deepEqual(graphApiUserList.continuationToken, token);
    });
});