'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import testHelpers = require('./../test-helpers');
import vstsConstants = require('./../../../src/vsts-constants');
import VstsGraphApiUserService = require('./../../../src/services/vsts-graph-api-user-service');
import VstsHelpers = require('./../../../src/vsts-helpers');
import VstsUser = require('./../../../src/models/vsts-user');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsGraphApiUserService} class defined in {@link ./src/services/vsts-graph-api-user-service.ts}
 */
suite('VSTS Graph API User Service Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let requestGetStub: Sinon.SinonStub;
    let vstsGraphApiUserService: VstsGraphApiUserService;
    let vstsHelpersBuildGraphApiUsersUrlStub: Sinon.SinonStub;
    let vstsHelpersBuildRestApiBasicAuthRequestOptionsStub: Sinon.SinonStub;
    let vstsHelpersBuildStorageKeyApiUrlStub: Sinon.SinonStub;
    let vstsHelpersAppendContinuationTokenStub: Sinon.SinonStub;
    const accountName = 'awesomeness';
    const pat = '1234567890abcdefghijklmnop';
    const apiCallErrorMessageBase = 'Encountered an error while retrieving VSTS users. Error details: ';
    const errorMessageBase = 'Encountered a fatal error while retrieving the complete set of VSTS users. ';
    const errorMessageDetails = 'Specific details of information';
    const vstsHelpersErrorMessageDetails = 'invalid arg';
    const errorMessage = errorMessageBase + errorMessageDetails;
    const graphApiThrownErrorMessage = errorMessageBase + apiCallErrorMessageBase + errorMessageDetails;
    const vstsHelpersErrorMessage = errorMessageBase + vstsHelpersErrorMessageDetails;
    const apiCallFailedErrorMessageSuffix = 'VSTS User API Call Failed.';
    const apiCallFailedErrorMessage = errorMessageBase + apiCallFailedErrorMessageSuffix;
    const jsonParseErrorMessageSuffix = 'Invalid or unexpected JSON encountered. Unable to determine VSTS Users.';
    const jsonParseErrorMessage = errorMessageBase + jsonParseErrorMessageSuffix;

    setup(() => {
        requestGetStub = sandbox.stub(request, 'get');
        vstsGraphApiUserService = new VstsGraphApiUserService();
        vstsHelpersBuildGraphApiUsersUrlStub = sandbox.stub(VstsHelpers, 'buildGraphApiUsersUrl');
        vstsHelpersBuildRestApiBasicAuthRequestOptionsStub = sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions').callsFake(() => {
            return { url: testHelpers.sampleUsageSummaryApiUrl };
        });
        vstsHelpersBuildStorageKeyApiUrlStub = sandbox.stub(VstsHelpers, 'buildStorageKeyApiUrl');
        vstsHelpersAppendContinuationTokenStub = sandbox.stub(VstsHelpers, 'appendContinuationToken');
    });

    teardown(() => {
        sandbox.restore();
        vstsGraphApiUserService = null;
    });

    suite('getAADUsers Suite:', () => {
        test('Should reject the promise with the correct error message when the VSTS Helpers URL Helper throws an exception',
            (done: () => void) => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers URL Helper throws an exception',
            async () => {
                    vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                    try {
                        await vstsGraphApiUserService.getAADUsers(accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    }
            }
        );

        test('Should reject the promise with the correct error message when the VSTS Helpers Request Options Helper throws an exception',
            (done: () => void) => {
                vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers Request Options Helper throws an exception',
            async () => {
                    vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.throws(new Error(vstsHelpersErrorMessageDetails));
                    try {
                        await vstsGraphApiUserService.getAADUsers(accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    }
            }
        );

        test('Should reject the promise with the correct error message when the VSTS Helpers URL Builder throws an exception',
            (done: () => void) => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers URL Builder throws an exception',
           async () => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get call throws an exception',
            (done: () => void) => {
                requestGetStub.throws(new Error(errorMessageDetails));
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, graphApiThrownErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get call throws an exception',
           async () => {
                requestGetStub.throws(new Error(errorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, graphApiThrownErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get callback has an error',
            (done: () => void) => {
                requestGetStub.yields(new Error(), {}, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get callback has an error',
           async () => {
                requestGetStub.yields(new Error(), {}, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 400',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 400',
           async () => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 401',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 401',
           async () => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 403',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 403',
           async () => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 404',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 404',
           async () => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 409',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 409',
           async () => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response is invalid json',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response is invalid json',
           async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                }
        });

        test('Should resolve the promise with the correct collection of Users when the Request Get call is successful',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                vstsGraphApiUserService.getAADUsers(accountName, pat).then((users: VstsUser[]) => {
                    assert.deepEqual(users.length, testHelpers.mixedOriginUsers.length);
                    done();
                });
        });

        test('Should have null storage keys for all users when call returns a failed status code',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http404Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should have null storage keys for all users when call returns an error',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(new Error(), testHelpers.http200Response, null);
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should have null storage keys for all users when an error is thrown',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    throw new Error();
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should return the correct collection Users when awaited when the Request Get call is successful',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                assert.deepEqual(users, testHelpers.mixedOriginUsers);
                users.forEach(u => {
                    assert.deepEqual(u.storageKey, testHelpers.sampleStorageKey);
                });
        });

        test('Should make subsequent calls when the HTTP response headers include a continuation token',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                vstsHelpersBuildGraphApiUsersUrlStub.callsFake(() => {
                    return testHelpers.sampleUsageSummaryApiUrl;
                });
                const httpResponse = {
                    statusCode: testHelpers.http200Response.statusCode,
                    headers: {
                        'x-ms-continuationtoken': testHelpers.continuationToken
                    }
                };
                requestGetStub.onFirstCall().yields(null, httpResponse, testHelpers.allAddOriginVstsGraphUsersApiJson);
                requestGetStub.onCall(4).yields(null, testHelpers.http200Response, testHelpers.allVstsOriginUsersGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                assert.deepEqual(users, testHelpers.mixedOriginUsers);
                users.forEach(u => {
                    assert.deepEqual(u.storageKey, testHelpers.sampleStorageKey);
                });
                assert.isTrue(vstsHelpersAppendContinuationTokenStub.calledWith(testHelpers.sampleUsageSummaryApiUrl, testHelpers.continuationToken));
        });

        test('Should specify a AAD filter value for subjectTypes parameter to default to all subjectTypes', async () => {
            vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                return testHelpers.sampleStorageKeyUrl;
            });
            requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
            requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
            const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
            assert.isTrue(vstsHelpersBuildGraphApiUsersUrlStub.calledWith(accountName, [ vstsConstants.aadGraphSubjectType ]));
        });
    });

    suite('getAllUsers Suite:', () => {
        test('Should reject the promise with the correct error message when the VSTS Helpers URL Helper throws an exception',
            (done: () => void) => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers URL Helper throws an exception',
            async () => {
                    vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                    try {
                        await vstsGraphApiUserService.getAllUsers(accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    }
            }
        );

        test('Should reject the promise with the correct error message when the VSTS Helpers Request Options Helper throws an exception',
            (done: () => void) => {
                vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers Request Options Helper throws an exception',
            async () => {
                    vstsHelpersBuildRestApiBasicAuthRequestOptionsStub.throws(new Error(vstsHelpersErrorMessageDetails));
                    try {
                        await vstsGraphApiUserService.getAllUsers(accountName, pat);
                    } catch (err) {
                        assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    }
            }
        );

        test('Should reject the promise with the correct error message when the VSTS Helpers URL Builder throws an exception',
            (done: () => void) => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers URL Builder throws an exception',
           async () => {
                vstsHelpersBuildGraphApiUsersUrlStub.throws(new Error(vstsHelpersErrorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get call throws an exception',
            (done: () => void) => {
                requestGetStub.throws(new Error(errorMessageDetails));
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, graphApiThrownErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get call throws an exception',
           async () => {
                requestGetStub.throws(new Error(errorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, graphApiThrownErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get callback has an error',
            (done: () => void) => {
                requestGetStub.yields(new Error(), {}, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get callback has an error',
           async () => {
                requestGetStub.yields(new Error(), {}, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 400',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 400',
           async () => {
                requestGetStub.yields(null, testHelpers.http400Response, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 401',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 401',
           async () => {
                requestGetStub.yields(null, testHelpers.http401Response, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 403',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 403',
           async () => {
                requestGetStub.yields(null, testHelpers.http403Response, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 404',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 404',
           async () => {
                requestGetStub.yields(null, testHelpers.http404Response, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response status code is 409',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response status code is 409',
           async () => {
                requestGetStub.yields(null, testHelpers.http409Response, null);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, apiCallFailedErrorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the Request Get response is invalid json',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get response is invalid json',
           async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.invalidJson);
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, jsonParseErrorMessage);
                }
        });

        test('Should resolve the promise with the correct collection of Users when the Request Get call is successful',
            (done: () => void) => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                vstsGraphApiUserService.getAllUsers(accountName, pat).then((users: VstsUser[]) => {
                    assert.deepEqual(users.length, testHelpers.mixedOriginUsers.length);
                    done();
                });
        });

        test('Should have null storage keys for all users when call returns a failed status code',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http404Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should have null storage keys for all users when call returns an error',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(new Error(), testHelpers.http200Response, null);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should have null storage keys for all users when an error is thrown',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    throw new Error();
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                users.forEach(u => {
                    assert.isNull(u.storageKey);
                });
        });

        test('Should return the correct collection Users when awaited when the Request Get call is successful',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                assert.deepEqual(users, testHelpers.mixedOriginUsers);
                users.forEach(u => {
                    assert.deepEqual(u.storageKey, testHelpers.sampleStorageKey);
                });
        });

        test('Should make subsequent calls when the HTTP response headers include a continuation token',
            async () => {
                vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                    return testHelpers.sampleStorageKeyUrl;
                });
                vstsHelpersBuildGraphApiUsersUrlStub.callsFake(() => {
                    return testHelpers.sampleUsageSummaryApiUrl;
                });
                const httpResponse = {
                    statusCode: testHelpers.http200Response.statusCode,
                    headers: {
                        'x-ms-continuationtoken': testHelpers.continuationToken
                    }
                };
                requestGetStub.onFirstCall().yields(null, httpResponse, testHelpers.allAddOriginVstsGraphUsersApiJson);
                requestGetStub.onCall(4).yields(null, testHelpers.http200Response, testHelpers.allVstsOriginUsersGraphUsersApiJson);
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                assert.deepEqual(users, testHelpers.mixedOriginUsers);
                users.forEach(u => {
                    assert.deepEqual(u.storageKey, testHelpers.sampleStorageKey);
                });
                assert.isTrue(vstsHelpersAppendContinuationTokenStub.calledWith(testHelpers.sampleUsageSummaryApiUrl, testHelpers.continuationToken));
        });

        test('Should specify a undefined value for subjectTypes parameter to default to all subjectTypes', async () => {
            vstsHelpersBuildStorageKeyApiUrlStub.callsFake(() => {
                return testHelpers.sampleStorageKeyUrl;
            });
            requestGetStub.onFirstCall().yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
            requestGetStub.yields(null, testHelpers.http200Response, testHelpers.storageKeyApiJson);
            const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
            assert.isTrue(vstsHelpersBuildGraphApiUsersUrlStub.calledWith(accountName, undefined));
        });
    });
});