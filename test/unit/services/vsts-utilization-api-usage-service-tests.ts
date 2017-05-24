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
    // let requestGetStub: Sinon.SinonStub;
    let vstsUtilizationApiUsageService: VstsUtilizationApiUsageService;
    let vstsHelpersbuildUtilizationUsageSummaryApiUrlStub: Sinon.SinonStub;
    // let vstsHelpersBuildRestApiBasicAuthRequestOptions: Sinon.SinonStub;
    const accountName = 'excellence';
    const invalidAccountName = ')123*&^&$ 78587@#!$6-';
    const pat = '09798563opiuyewrtrtyyuiu';
    const helpersErrorMessageDetails = 'oops';
    const validUserId = testHelpers.sampleGuid; 
    const dateRange = testHelpers.validIsoDateRange;
    const invalidAccountErrorMessage = 'Invalid account name.';
    const invalidUserIdErrorMessage = 'Invalid user id';

    setup(() => {
        vstsUtilizationApiUsageService = new VstsUtilizationApiUsageService();
        // requestGetStub = sandbox.stub(request, 'get');
        vstsHelpersbuildUtilizationUsageSummaryApiUrlStub = sandbox.stub(VstsHelpers, 'buildUtilizationUsageSummaryApiUrl');
        // vstsHelpersBuildRestApiBasicAuthRequestOptions = sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions');
    });

    teardown(() => {
        sandbox.restore();
        vstsUtilizationApiUsageService = null;
    });

    // eslint-disable-next-line max-statements
    suite('getUserActivityFromYesterday Suite:', () => {
        let helpersGetYesterdayUtcDateRangeStub: Sinon.SinonStub;
        const baseErrorMessage = 'Encountered an error while attempting to build inputs to retrieve VSTS User Activity ' +
                'from yesterday. Error details: ';
        const expectedDateRangeErrorMesage = baseErrorMessage + helpersErrorMessageDetails;
        const apiCallBaseErrorMessage = 'Unable to retrieve VSTS User Activity. Error details: ';
        const expectedUserIdErrorMessage = apiCallBaseErrorMessage + invalidUserIdErrorMessage;
        const expectedAccountErrorMessage = apiCallBaseErrorMessage + invalidAccountErrorMessage;

        setup(() => {
            helpersGetYesterdayUtcDateRangeStub = sandbox.stub(helpers, 'getYesterdayUtcDateRange').callsFake(() => { return dateRange; });
        });

        test('Should reject the promise when the getYesterdayUtcDateRange throws an exception',
            (done: () => void) => {
                helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                    done();
                });
        });

        test('Should throw error when awaited when the getYesterdayUtcDateRange throws an exception',
           async () => {
                helpersGetYesterdayUtcDateRangeStub.callsFake(() => { throw new Error(helpersErrorMessageDetails); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(validUserId, accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, expectedDateRangeErrorMesage);
                }
        });

        test('Should reject the promise when userId is null, accountName is null, and accessToken is null',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is null, and accessToken is null',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, null);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is null, and accessToken is undefined',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is null, and accessToken is undefined',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, undefined);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is null, and accessToken is empty',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, '').catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is null, and accessToken is empty',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, '');
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is null, and accessToken is valid',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is null, and accessToken is valid',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, null, pat);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is undefined, and accessToken is null',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is null',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, null);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is undefined, and accessToken is undefined',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is undefined', async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, undefined);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is undefined, and accessToken is empty',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, '').catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is empty',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, '');
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is undefined, and accessToken is valid',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is undefined, and accessToken is valid',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, undefined, pat);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is empty, and accessToken is null',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is null',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', null);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is empty, and accessToken is undefined',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is undefined', async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', undefined);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is empty, and accessToken is empty',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', '').catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is empty',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', '');
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is empty, and accessToken is valid',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is empty, and accessToken is valid',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, '', pat);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is invalid, and accessToken is null',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is null',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is invalid, and accessToken is undefined',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is undefined', async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is invalid, and accessToken is empty',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, '').catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is empty',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, '');
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is invalid, and accessToken is valid',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is invalid, and accessToken is valid',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
        });


        test('Should reject the promise when userId is null, accountName is valid, and accessToken is null',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is null',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, null);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is valid, and accessToken is undefined',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is undefined', async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, undefined);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is valid, and accessToken is empty',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, '').catch((err: Error) => {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is empty',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidUserIdErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, '');
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedUserIdErrorMessage);
                }
        });

        test('Should reject the promise when userId is null, accountName is valid, and accessToken is valid',
            (done: () => void) => {
                vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                    done();
                });
        });

        test('Should throw error when awaited when userId is null, accountName is valid, and accessToken is valid',
           async () => {
               vstsHelpersbuildUtilizationUsageSummaryApiUrlStub.callsFake(() => { throw new Error(invalidAccountErrorMessage); });
                try {
                    await vstsUtilizationApiUsageService.getUserActivityFromYesterday(null, invalidAccountName, pat);
                    assert.isTrue(helpersGetYesterdayUtcDateRangeStub.called);
                } catch (err) {
                    assert.deepEqual(err.message, expectedAccountErrorMessage);
                }
        });
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