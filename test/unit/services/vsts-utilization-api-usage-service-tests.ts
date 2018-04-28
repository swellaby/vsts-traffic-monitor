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
    let helpersSleepAsyncStub: Sinon.SinonStub;
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
    const requestErrorMessageDetails = 'fail';
    const userApiCalledFailedErrorMessageBase = 'VSTS User Activity API Call Failed.';
    const userApiCalledFailledStatusCodeErrorMessageSuffix = ' Response status code: ';
    const userApiCalledFailedWithStatusCodeErrorMessage = userApiCalledFailedErrorMessageBase + userApiCalledFailledStatusCodeErrorMessageSuffix;
    const jsonParseErrorMessage = 'Invalid or unexpected JSON response from VSTS API. Unable to determine VSTS User Activity.';
    const expectedRequestThrownErrorMessage = apiCallBaseErrorMessage + requestErrorMessageDetails;
    const expectedUserIdErrorMessage = apiCallBaseErrorMessage + invalidUserIdErrorMessage;
    const expectedAccountErrorMessage = apiCallBaseErrorMessage + invalidAccountErrorMessage;
    const expectedTokenErrorMessage = apiCallBaseErrorMessage + invalidTokenErrorMessage;
    const throttlePeriodSeconds = 20;
    const throttlePeriodMilliseconds = throttlePeriodSeconds * 1000;
    const httpResponseWithThrottleHeader = {
        statusCode: testHelpers.http200Response.statusCode,
        headers: {
            'retry-after': throttlePeriodSeconds
        }
    };

    setup(() => {
        vstsUtilizationApiUsageService = new VstsUtilizationApiUsageService();
        requestGetStub = sandbox.stub(request, 'get');
        vstsHelpersbuildUtilizationUsageSummaryApiUrlStub = sandbox.stub(VstsHelpers, 'buildUtilizationUsageSummaryApiUrl').callsFake(() => {
            throw new Error(invalidUserIdErrorMessage);
        });
        vstsHelpersBuildRestApiBasicAuthRequestOptionsStub = sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions').callsFake(() => {
            throw new Error(invalidTokenErrorMessage);
        });
        helpersSleepAsyncStub = sandbox.stub(helpers, 'sleepAsync').callsFake(() => {
            return Promise.resolve();
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
        vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { return validUtilizationSummaryApiUrl; });
    };

    /**
     * Helper function to set the VstsHelper buildRestApiBasicAuthRequestOptions Stub to return a valid URL.
     */
    const setBuildRestApiRequestOptionsStubToReturnValidValue = () => {
        vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.callsFake(() => { return { }; });
    };

    /**
     * Helper function to set the Request get Stub to throw an error.
     */
    const setRequestGetStubToThrowError = () => {
        requestGetStub.callsFake(() => { throw new Error(requestErrorMessageDetails); });
    };

    suite('getUserActivityFromYesterday Suite:', () => {
        let helpersGetYesterdayUtcDateRangeStub: Sinon.SinonStub;
        const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'from yesterday. Error details: ';
        const expectedDateRangeErrorMesage = baseErrorMessage + helpersErrorMessageDetails;

        setup(() => {
            helpersGetYesterdayUtcDateRangeStub = sandbox.stub(helpers, 'getYesterdayUtcDateRange').callsFake(() => { return dateRange; });
        });

        test('Should reject the promise when the getYesterdayUtcDateRange call throws an exception', (done: () => void) => {
            helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                done();
            });
        });

        test('Should throw error when awaited when the getYesterdayUtcDateRange call throws an exception', async () => {
            helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            try {
                await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
            } catch (err) {
                assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
            }
        });

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
            setup(() => {
                setBuildUtilizationApiStubToReturnValidUrl();
                setBuildRestApiRequestOptionsStubToReturnValidValue();
            });

            test('Should reject promise when the Request Get call throws an exception', (done: () => void) => {
                setRequestGetStubToThrowError();
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedRequestThrownErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get call throws an exception', async () => {
                setRequestGetStubToThrowError();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedRequestThrownErrorMessage);
                }
            });

            test('Should reject promise when the Request Get callback has an error', (done: () => void) => {
                requestGetStub.yields(new Error(), {}, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedErrorMessageBase);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get callback has an error', async () => {
                requestGetStub.yields(new Error(), {}, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedErrorMessageBase);
                }
            });

            test('Should reject promise when the Request Get response status code is 400', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '400');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 400', async () => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '400');
                }
            });

            test('Should reject promise when the Request Get response status code is 401', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '401');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 401', async () => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '401');
                }
            });

            test('Should reject promise when the Request Get response status code is 403', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '403');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 403', async () => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '403');
                }
            });

            test('Should reject promise when the Request Get response status code is 404', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '404');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 404', async () => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '404');
                }
            });

            test('Should reject promise when the Request Get response status code is 409', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '409');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 409', async () => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '409');
                }
            });

            test('Should reject promise when the Request Get response is invalid json', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response is invalid json', async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                }
            });

            test('Should resolve promise with correct usage records when the Request Get call is successful', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.usageRecordsJson);
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).then((usageRecords: VstsUsageRecord[]) => {
                    assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                    assert.deepEqual(usageRecords, testHelpers.usageRecords);
                    done();
                }).catch((err: Error) => {
                    throw err;
                });
            });

            test('Should return correct usage records when awaited when the Request Get call is successful', async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.usageRecordsJson);
                const usageRecords = await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                assert.deepEqual(usageRecords, testHelpers.usageRecords);
            });

            test('Should throttle for the specified time when the HTTP Response requests throttling', async () => {
                requestGetStub.yields(null, httpResponseWithThrottleHeader, testHelpers.usageRecordsJson);
                const usageRecords = await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                assert.deepEqual(usageRecords, testHelpers.usageRecords);
                assert.isTrue(helpersSleepAsyncStub.calledWith(throttlePeriodMilliseconds));
            });
        });
    });

    suite('getUserActivityOnDate Suite:', () => {
        let helpersBuildUtcIsoDateRangeStub: Sinon.SinonStub;
        const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
            'on the specified date. Error details: ';
        const expectedDateRangeErrorMesage = baseErrorMessage + helpersErrorMessageDetails;
        const validDate = new Date();

        setup(() => {
            helpersBuildUtcIsoDateRangeStub = sandbox.stub(helpers, 'buildUtcIsoDateRange').callsFake((date: Date) => {
                if (!date) {
                    throw new Error(helpersErrorMessageDetails);
                }
                return testHelpers.validIsoDateRange;
            });
        });

        suite('Null userId Suite:', () => {
            suite('Null date Suite:', () => {
                test('Should reject the promise when userId is null, date is null, accountName is null, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is null, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is null, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is null, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is undefined, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is undefined, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is undefined, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is empty, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is empty, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is empty, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is empty, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is empty, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is empty, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is invalid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is invalid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is invalid, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is invalid, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is invalid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is invalid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is invalid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is valid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is valid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is null, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is null, date is null, accountName is valid, and accessToken is empty',
                (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is valid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is null, date is null, accountName is valid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is null, accountName is valid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Undefined date Suite:', () => {
                test('Should reject the promise when userId is null, date is undefined, accountName is null, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is null, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is null, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is null, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is null, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is null, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is undefined, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is undefined, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is undefined, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is empty, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is empty, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is empty, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is empty, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is empty, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is empty, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is empty, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is invalid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is invalid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is invalid, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is invalid, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is invalid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is invalid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is invalid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is valid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is valid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is null, date is undefined, accountName is valid, and accessToken is empty',
                (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is valid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is null, date is undefined, accountName is valid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is undefined, accountName is valid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, undefined, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Valid date Suite:', () => {
                test('Should reject the promise when userId is null, date is valid, accountName is null, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is null, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is null, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is null, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is null, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is undefined, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is undefined, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is undefined, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is empty, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is empty, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is empty, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is empty, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is empty, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is empty, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is empty, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is invalid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is invalid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is invalid, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is invalid, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is invalid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is invalid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is invalid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is valid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is valid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        }
                });

                test('Should reject the promise when userId is null, date is valid, accountName is valid, and accessToken is empty',
                (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is valid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject promise when userId is null, date is valid, accountName is valid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is null, date is valid, accountName is valid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(null, validDate, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });
            });
        });

        suite('Undefined userId Suite:', () => {
            suite('Null date Suite:', () => {
                test('Should reject the promise when userId is undefined, date is null, accountName is null, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is null, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is null, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is null, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is null, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is null, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is undefined, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is undefined, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is undefined, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is empty, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is empty, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is empty, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is empty, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is empty, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is empty, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is empty, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is invalid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is invalid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is invalid, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is invalid, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is invalid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is invalid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is invalid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is valid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is valid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is undefined, date is null, accountName is valid, and accessToken is empty',
                (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is valid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is undefined, date is null, accountName is valid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is null, accountName is valid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, null, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Undefined date Suite:', () => {
                test('Should reject the promise when userId is undefined, date is undefined, accountName is null, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is null, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is null, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is null, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is null, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is null, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is undefined, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is undefined, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is undefined, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is empty, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is empty, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is empty, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is empty, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is empty, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is empty, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is empty, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is invalid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is invalid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is invalid, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is invalid, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is invalid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is invalid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is invalid, and accessToken is valid',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is valid, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is valid, and accessToken is null',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is undefined, date is undefined, accountName is valid, and accessToken is empty',
                (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is valid, and accessToken is empty',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is undefined, date is undefined, accountName is valid, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is undefined, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, undefined, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Valid date Suite:', () => {
                test('Should reject the promise when userId is undefined, date is valid, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        }
                });

                test('Should reject the promise when userId is undefined, date is valid, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject promise when userId is undefined, date is valid, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is undefined, date is valid, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(undefined, validDate, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });
            });
        });

        suite('Empty userId Suite:', () => {
            suite('Null date Suite:', () => {
                test('Should reject the promise when userId is empty, date is null, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is empty, date is null, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is empty, date is null, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is null, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, null, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Undefined date Suite:', () => {
                test('Should reject the promise when userId is empty, date is undefined, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is empty, date is undefined, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is empty, date is undefined, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is undefined, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, undefined, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Valid date Suite:', () => {
                test('Should reject the promise when userId is empty, date is valid, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        }
                });

                test('Should reject the promise when userId is empty, date is valid, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject promise when userId is empty, date is valid, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is empty, date is valid, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(empty, validDate, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });
            });
        });

        suite('Invalid userId Suite:', () => {
            suite('Null date Suite:', () => {
                test('Should reject the promise when userId is invalid, date is null, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is invalid, date is null, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is invalid, date is null, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is null, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, null, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Undefined date Suite:', () => {
                test('Should reject the promise when userId is invalid, date is undefined, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is null, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is null, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is undefined, and accessToken is null',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is undefined, and accessToken is undefined',
                async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is undefined, and accessToken is empty',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is undefined, and accessToken is valid',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is empty, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is invalid, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        }
                });

                test('Should reject the promise when userId is invalid, date is undefined, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });

                test('Should reject promise when userId is invalid, date is undefined, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is undefined, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, undefined, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    }
                });
            });

            suite('Valid date Suite:', () => {
                test('Should reject the promise when userId is invalid, date is valid, accountName is null, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, null).catch((err: Error) => {
                        assert.isTrue(helpersBuildUtcIsoDateRangeStub.called);
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is null, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is null, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is null, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is null, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is null, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is null, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is null, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, null, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is undefined, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is undefined, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is undefined, and accessToken is undefined',
                (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is undefined, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is undefined, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is undefined, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, undefined, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is empty, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is empty, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is empty, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is empty, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is empty, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is empty, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is empty, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, empty, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is invalid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is invalid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, undefined).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is invalid, and accessToken is undefined', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, undefined);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, empty).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is invalid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is invalid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, invalidAccountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is valid, and accessToken is null', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, null).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is valid, and accessToken is null', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, null);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is valid, and accessToken is undefined',
                    (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, undefined).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is valid, and accessToken is undefined',
                    async () => {
                        try {
                            await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, undefined);
                        } catch (err) {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        }
                });

                test('Should reject the promise when userId is invalid, date is valid, accountName is valid, and accessToken is empty', (done: () => void) => {
                        vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, empty).catch((err: Error) => {
                            assert.deepEqual(err.message, expectedUserIdErrorMessage);
                            done();
                        });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is valid, and accessToken is empty', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, empty);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });

                test('Should reject promise when userId is invalid, date is valid, accountName is valid, and accessToken is valid', (done: () => void) => {
                    vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, pat).catch((err: Error) => {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                        done();
                    });
                });

                test('Should throw error when awaited when userId is invalid, date is valid, accountName is valid, and accessToken is valid', async () => {
                    try {
                        await vstsUtilizationApiUsageService.getUserActivityOnDate(invalidUserId, validDate, accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    }
                });
            });
        });
    });

    suite('getUserActivityOverLast24Hours Suite:', () => {
        let helpersgetLast24HoursUtcDateRangeStub: Sinon.SinonStub;
        const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
            'over the last 24 hours. Error details: ';
        const expectedDateRangeErrorMesage = baseErrorMessage + helpersErrorMessageDetails;

        setup(() => {
            helpersgetLast24HoursUtcDateRangeStub = sandbox.stub(helpers, 'getLast24HoursUtcDateRange');
        });

        test('Should reject the promise when the getLast24HoursUtcDateRange call throws an exception', (done: () => void) => {
            helpersgetLast24HoursUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                assert.isTrue(helpersgetLast24HoursUtcDateRangeStub.called);
                done();
            });
        });

        test('Should throw error when awaited when the getLast24HoursUtcDateRange call throws an exception', async () => {
            helpersgetLast24HoursUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
            try {
                await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
            } catch (err) {
                assert.isTrue(helpersgetLast24HoursUtcDateRangeStub.called);
                assert.deepEqual(err.message, expectedDateRangeErrorMesage);
            }
        });

        suite('Null userId Suite:', () => {
            test('Should reject the promise when userId is null, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, null).catch((err: Error) => {
                    assert.isTrue(vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.called);
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is null, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(null, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        suite('Undefined userId Suite:', () => {
            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is undefined, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is undefined, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(undefined, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        suite('Empty User Id Suite: ', () => {
            test('Should reject the promise when userId is empty, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is empty, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is empty, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(empty, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        suite('Invalid userId Suite:', () => {
            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });

            test('Should reject the promise when userId is invalid, accountName is valid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is invalid, accountName is valid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(invalidUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
            });
        });

        suite('Valid userId Suite:', () => {
            setup(() => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is null, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is null, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, null, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is undefined, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is undefined, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, undefined, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is empty, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is empty, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, empty, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is null', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is null', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is undefined', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is undefined', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is empty', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, empty).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is empty', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is invalid, and accessToken is valid', (done: () => void) => {
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is invalid, and accessToken is valid', async () => {
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, invalidAccountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is null', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is null', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, null);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is undefined', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is undefined', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, undefined);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });

            test('Should reject the promise when userId is valid, accountName is valid, and accessToken is empty', (done: () => void) => {
                setBuildUtilizationApiStubToReturnValidUrl();
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, empty).catch((err: Error) => {
                    assert.isTrue(vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.called);
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when userId is valid, accountName is valid, and accessToken is empty', async () => {
                setBuildUtilizationApiStubToReturnValidUrl();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, empty);
                } catch (err) {
                    assert.deepEqual(err.message, expectedTokenErrorMessage);
                }
            });
        });

        suite('Request Get Suite:', () => {
            setup(() => {
                setBuildUtilizationApiStubToReturnValidUrl();
                setBuildRestApiRequestOptionsStubToReturnValidValue();
            });

            test('Should reject promise when the Request Get call throws an exception', (done: () => void) => {
                setRequestGetStubToThrowError();
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedRequestThrownErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get call throws an exception', async () => {
                setRequestGetStubToThrowError();
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedRequestThrownErrorMessage);
                }
            });

            test('Should reject promise when the Request Get callback has an error', (done: () => void) => {
                requestGetStub.yields(new Error(), {}, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedErrorMessageBase);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get callback has an error', async () => {
                requestGetStub.yields(new Error(), {}, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedErrorMessageBase);
                }
            });

            test('Should reject promise when the Request Get response status code is 400', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '400');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 400', async () => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '400');
                }
            });

            test('Should reject promise when the Request Get response status code is 401', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '401');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 401', async () => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '401');
                }
            });

            test('Should reject promise when the Request Get response status code is 403', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '403');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 403', async () => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '403');
                }
            });

            test('Should reject promise when the Request Get response status code is 404', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '404');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 404', async () => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '404');
                }
            });

            test('Should reject promise when the Request Get response status code is 409', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '409');
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response status code is 409', async () => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, userApiCalledFailedWithStatusCodeErrorMessage + '409');
                }
            });

            test('Should reject promise when the Request Get response is invalid json', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                    done();
                });
            });

            test('Should throw error when awaited when the Request Get response is invalid json', async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                try {
                    await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                }
            });

            test('Should resolve promise with correct usage records when the Request Get call is successful', (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.usageRecordsJson);
                vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat).then((usageRecords: VstsUsageRecord[]) => {
                    assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                    assert.deepEqual(usageRecords, testHelpers.usageRecords);
                    done();
                }).catch((err: Error) => {
                    throw err;
                });
            });

            test('Should return correct usage records when awaited when the Request Get call is successful', async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.usageRecordsJson);
                const usageRecords = await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                assert.deepEqual(usageRecords, testHelpers.usageRecords);
            });

            test('Should throttle for the specified time when the HTTP Response requests throttling', async () => {
                requestGetStub.yields(null, httpResponseWithThrottleHeader, testHelpers.usageRecordsJson);
                const usageRecords = await vstsUtilizationApiUsageService.getUserActivityOverLast24Hours(validUserId, accountName, pat);
                assert.deepEqual(usageRecords.length, testHelpers.usageRecords.length);
                assert.deepEqual(usageRecords, testHelpers.usageRecords);
                assert.isTrue(helpersSleepAsyncStub.calledWith(throttlePeriodMilliseconds));
            });
        });
    });
});