'use strict';

import chai = require('chai');
import mocha = require('mocha');

import VstsStorageKey = require('./../../../src/models/vsts-storage-key');

const assert = chai.assert;

suite('VstsStorageKey Suite:', () => {
    let storageKey: VstsStorageKey;
    const value = 'a1197421-8c6f-4b53-984d-8f048f55ade5';

    setup(() => {
        storageKey = new VstsStorageKey();
    });

    teardown(() => {
        storageKey = null;
    });

    test('Should have accessible property value', () => {
        storageKey.value = value;
        assert.deepEqual(storageKey.value, value);
    });
});