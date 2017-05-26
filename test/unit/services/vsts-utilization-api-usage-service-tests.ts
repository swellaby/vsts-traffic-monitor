'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import helpers = require('./../../../src/helpers');
import testHelpers = require('./../test-helpers');
import VstsHelpers = require('./../../../src/vsts-helpers');
import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');
import VstsUtilizationApiUsageService = require('./../../../src/services/vsts-utilization-api-usage-service');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsUtilizationApiUsageService} class
 * defined in {@link ./src/services/vsts-utilization-api-usage-service.ts}
 */
suite('VstsUtilizationApiUsageService Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let requestGetStub: Sinon.SinonStub;
    let vstsUtilizationApiUsageService: VstsUtilizationApiUsageService;
    let vstsHelpersbuildUtilizationUsageSummaryApiUrlStub: Sinon.SinonStub;
    let vstsHelpersBuildRestApiBasicAuthRequestOptionsStub: Sinon.SinonStub;
    const accountName = 'excellence';
    const empty = testHelpers.emptyString;
    const invalidAccountName = ')123*&^&$ 78587@#!$6-';
    const pat = '09798563opiuyewrtrtyyuiu';
    const helpersErrorMessageDetails = 'oops';
    const validUserId = testHelpers.sampleGuid;
    const invalidUserId = testHelpers.invalidGuid;
    const dateRange = testHelpers.validIsoDateRange;
    const validUtilizationSummaryApiUrl = 'https://foo.visualstudio.com/_apis/utilization';
    const invalidAccountErrorMessage = 'Invalid account name.';
    const invalidUserIdErrorMessage = 'Invalid user id';
    const invalidTokenErrorMessage = 'Invalid access token.';
    const apiCallBaseErrorMessage = 'Unable to retrieve VSTS User Activity. Error details: ';
    const expectedUserIdErrorMessage = apiCallBaseErrorMessage + invalidUserIdErrorMessage;
    const expectedAccountErrorMessage = apiCallBaseErrorMessage + invalidAccountErrorMessage;
    const expectedTokenErrorMessage = apiCallBaseErrorMessage + invalidTokenErrorMessage;

    setup(() => {
        vstsUtilizationApiUsageService = new VstsUtilizationApiUsageService();
        requestGetStub = sandbox.stub(request, 'get');
        vstsHelpersbuildUtilizationUsageSummaryApiUrlStub = sandbox.stub(VstsHelpers, 'buildUtilizationUsageSummaryApiUrl').callsFake(() => {
            throw new Error(invalidUserIdErrorMessage);
        });
        vstsHelpersBuildRestApiBasicAuthRequestOptionsStub = sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions').callsFake(() => {
            throw new Error(invalidTokenErrorMessage);
        });
    });

    teardown(() => {
        sandbox.restore();
        vstsUtilizationApiUsageService = null;
    });

    /**
     * Helper function to set the VstsHelper BuiltUtilizationUsageSummaryApiUrl Stub to return a valid URL.
     */
    const setBuildUtilizationApiStubToReturnValidUrl = () => {
        vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { return validUtilizationSummaryApiUrl });
    }

    // eslint-disable-next-line max-statements
    suite('getUserActivityFromYesterday Suite:', () => {
        let helpersGetYesterdayUtcDateRangeStub: Sinon.SinonStub;
        const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'from yesterday. Error details: ';
        const expectedDateRangeErrorMesage = baseErrorMessage + helpersErrorMessageDetails;

        setup(() => {
            helpersGetYesterdayUtcDateRangeStub = sandbox.stub(helpers, 'getYesterdayUtcDateRange').callsFake(() => { return dateRange; });
        });

        test('Should reject the promise when the getYesterdayUtcDateRange throws an exception', (done: () => void) => {
            helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                done();
            });
        });

        test('Should throw error when awaited when the getYesterdayUtcDateRange throws an exception', async () => {
            helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            try {
                await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
            } catch (err) {
                assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
            }
        });

        // eslint-disable-next-line max-statements
        suite('Null userId Suite:', () => {
            test('Should reject the promise when userId is null, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, null).catch((err: Error) => {
                    assert.isTrue(vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.called);
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        // eslint-disable-next-line max-statements
        suite('Undefined userId Suite:', () => {
            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(undefined, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        // eslint-disable-next-line max-statements
        suite('Empty User Id Suite: ', () => {
            test('Should reject the promise when userId is empty, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(empty, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        // eslint-disable-next-line max-statements
        suite('Invalid userId Suite:', () => {
            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(invalidUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        // eslint-disable-next-line max-statements
        suite('Valid userId Suite:', () => {
            setup(() => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is null', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is null', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is undefined', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is undefined', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is empty', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, empty).catch((err: Error) => {
                    assert.isTrue(vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.called);
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is empty', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });
        });

        suite('Request Get Suite:', () => {
            const requestErrorMessageDetails = '';
            const expectedRequestErrorMessage = '';

            test('Should reject promise when the Request Get call throws an exception', (done: () => void) => {
                requestGetStub.throws(new Error(requestErrorMessageDetails));
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedRequestErrorMessage);
                    done();
                });
        });

        // test('Should throw an error when awaited with the correct error message when the Request Get call throws an exception',
        //    async () => {
        //         requestGetStub.throws(new Error(errorMessageDetails));
        //         try {
        //             await vstsGraphApiUserService.getAllUsers(accountName, pat);
        //         } catch (err) {
        //             assert.deepEqual(err.message, errorMessage);
        //         }
        // });
        });

            // test('Should succeed building input when userId is valid, accountName is valid, and accessToken is valid', (done: () => void) => {
            //     setBuildUtilizationApiStubToReturnValidUrl();
            //     vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.callsFake(() => { return { } });
            //     requestGetStub.yields(null, testHelpers.http200Response, empty);
            //     vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).then(() => {
            //         assert.isTrue(vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.called);
            //         assert.isTrue(requestGetStub.called);
            //         done();
            //     });
            // });

            // test('Should succeed building input when awaited when userId is valid, accountName is valid, and accessToken is valid', async () => {
            //     setBuildUtilizationApiStubToReturnValidUrl();
            //     vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.callsFake(() => { return { } });
            //     requestGetStub.yields(null, testHelpers.http200Response, empty);
            //     await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
            //     assert.isTrue(vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.called);
            //     assert.isTrue(requestGetStub.called);
            // });
    });

    // suite('getUserActivityOnDate Suite:', () => {
    //     let helpersbuildUtcIsoDateRangeStub: Sinon.SinonStub;

    //     setup(() => {
    //         helpersbuildUtcIsoDateRangeStub = sandbox.stub(helpers, 'buildUtcIsoDateRange');
    //     });

    // });

    // suite('getUserActivityOverLast24Hours Suite:', () => {
    //     let helpersgetLast24HoursUtcDateRangeStub: Sinon.SinonStub;

    //     setup(() => {
    //         helpersgetLast24HoursUtcDateRangeStub = sandbox.stub(helpers, 'getLast24HoursUtcDateRange');
    //     });

    // });
})