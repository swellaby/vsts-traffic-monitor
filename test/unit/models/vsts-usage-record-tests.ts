'use strict';

import chai = require('chai');

import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');

const assert = chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUsageRecord} class defined in {@link ./src/models/vsts-usage-record.ts}
 */
suite('VstsUsageRecord Suite:', () => {
    let usageRecord: VstsUsageRecord;

    setup(() => {
        usageRecord = new VstsUsageRecord();
    });

    teardown(() => {
        usageRecord = null;
    });

    test('Should have accessible application property', () => {
        const application = 'Web Access';
        usageRecord.application = application;
        assert.deepEqual(usageRecord.application, application);
    });

    test('Should have accessible command property', () => {
        const command = 'Account.Home';
        usageRecord.command = command;
        assert.deepEqual(usageRecord.command, command);
    });

    test('Should have accessible count property', () => {
        const count = 2;
        usageRecord.count = count;
        assert.deepEqual(usageRecord.count, count);
    });

    test('Should have accessible delay property', () => {
        const delay = 0;
        usageRecord.delay = delay;
        assert.deepEqual(usageRecord.delay, delay);
    });

    test('Should have accessible delay property', () => {
        const delay = 0;
        usageRecord.delay = delay;
        assert.deepEqual(usageRecord.delay, delay);
    });

    test('Should have accessible endTime property', () => {
        const endTime = new Date().toISOString();
        usageRecord.endTime = endTime;
        assert.deepEqual(usageRecord.endTime, endTime);
    });

    test('Should have accessible ipAddress property', () => {
        const ipAddress = '192.180.100.01';
        usageRecord.ipAddress = ipAddress;
        assert.deepEqual(usageRecord.ipAddress, ipAddress);
    });

    test('Should have accessible startTime property', () => {
        const startTime = new Date().toISOString();
        usageRecord.startTime = startTime;
        assert.deepEqual(usageRecord.startTime, startTime);
    });

    test('Should have accessible usage property', () => {
        const usage = 0.00;
        usageRecord.usage = usage;
        assert.deepEqual(usageRecord.usage, usage);
    });

    test('Should have accessible userAgent property', () => {
        const userAgent = 'Mozilla/5.0';
        usageRecord.userAgent = userAgent;
        assert.deepEqual(usageRecord.userAgent, userAgent);
    });
});