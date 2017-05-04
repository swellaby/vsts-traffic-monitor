'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import testHelpers = require('./../test-helpers');
import VstsGraphApiUserService = require('./../../../src/services/vsts-graph-api-user-service');
import VstsHelpers = require('./../../../src/vsts-helpers');
import VstsUser = require('./../../../src/models/vsts-user');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsGraphApiUserService} class defined in {@link ./src/services/vsts-graph-api-user-service.ts}
 */
// eslint-disable-next-line max-statements
suite('VSTS Graph API User Service Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let requestGetStub: Sinon.SinonStub;
    let vstsGraphApiUserService: VstsGraphApiUserService;
    let vstsHelpersBuildGraphApiUsersUrlStub: Sinon.SinonStub;
    let vstsHelpersBuildRestApiBasicAuthRequestOptions: Sinon.SinonStub;
    const accountName = 'awesomeness';
    const pat = '1234567890abcdefghijklmnop';

    setup(() => {
        requestGetStub = sandbox.stub(request, 'get');
        vstsGraphApiUserService = new VstsGraphApiUserService();
        vstsHelpersBuildGraphApiUsersUrlStub = sandbox.stub(VstsHelpers, 'buildGraphApiUsersUrl');
        vstsHelpersBuildRestApiBasicAuthRequestOptions = sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions');
    });

    teardown(() => {
        sandbox.restore();
        vstsGraphApiUserService = null;
    });

    // eslint-disable-next-line max-statements
    suite('getAADUsers Suite:', () => {
        const errorMessageBase = 'Encountered an error while retrieving VSTS users from AAD. Error details: ';
        const errorMessageDetails = 'Specifics';
        const noUsersErrorMessage = 'Encountered an error retrieving user information from VSTS.';
        const errorMessage = errorMessageBase + errorMessageDetails;
        let getAllUsersStub: Sinon.SinonStub;

        setup(() => {
            getAllUsersStub = sandbox.stub(VstsGraphApiUserService.prototype, 'getAllUsers');
        });

        test('Should reject the promise with the correct error message when the getAllUsersCall throws an exception',
            (done: () => void) => {
                getAllUsersStub.throws(new Error(errorMessageDetails));
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, errorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the getAllUsersCall throws an exception',
           async () => {
                getAllUsersStub.throws(new Error(errorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, errorMessage);
                }
        });

        test('Should reject the promise with the correct error message when the getAllUsersCall returns null',
            (done: () => void) => {
                getAllUsersStub.callsFake(() => { return null; });
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, noUsersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the getAllUsersCall returns null',
           async () => {
                getAllUsersStub.callsFake(() => { return null; });
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, noUsersErrorMessage);
                }
            }
        );

        test('Should reject the promise with the correct error message when the getAllUsersCall returns undefined',
            (done: () => void) => {
                getAllUsersStub.callsFake(() => { return undefined; });
                vstsGraphApiUserService.getAADUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, noUsersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the getAllUsersCall returns undefined',
           async () => {
                getAllUsersStub.callsFake(() => { return undefined; });
                try {
                    await vstsGraphApiUserService.getAADUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, noUsersErrorMessage);
                }
        });

        test('Should resolve the promise with the an empty collection of users when the getAllUsersCall returns an array of users ' +
            'that are all sourced from VSTS', (done: () => void) => {
                getAllUsersStub.callsFake(() => { return testHelpers.allVstsOriginUsers; });
                vstsGraphApiUserService.getAADUsers(accountName, pat).then((users: VstsUser[]) => {
                    assert.deepEqual(users.length, 0);
                    done();
                });
        });

        test('Should return an empty collection of users when the getAllUsersCall an array of users that are all sourced from VSTS',
           async () => {
                getAllUsersStub.callsFake(() => { return testHelpers.allVstsOriginUsers; });
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                assert.deepEqual(users.length, 0);
        });

        test('Should resolve the promise with the correct collection of users when the getAllUsersCall returns an array of users ' +
            'that are sourced from AAD', (done: () => void) => {
                getAllUsersStub.callsFake(() => { return testHelpers.mixedOriginUsers; });
                vstsGraphApiUserService.getAADUsers(accountName, pat).then((users: VstsUser[]) => {
                    assert.deepEqual(users.length, 3);
                    done();
                });
        });

        test('Should return the correct collection of users when the getAllUsersCall an array of users that are sourced from AAD',
           async () => {
                getAllUsersStub.callsFake(() => { return testHelpers.mixedOriginUsers; });
                const users = await vstsGraphApiUserService.getAADUsers(accountName, pat);
                assert.deepEqual(users.length, 3);
        });
    });

    // eslint-disable-next-line max-statements
    suite('getAllUsers Suite:', () => {
        const errorMessageBase = 'Encountered an error while retrieving VSTS users. Error details: ';
        const errorMessageDetails = 'Specific details of information';
        const vstsHelpersErrorMessageDetails = 'invalid arg';
        const errorMessage = errorMessageBase + errorMessageDetails;
        const vstsHelpersErrorMessage = errorMessageBase + vstsHelpersErrorMessageDetails;
        const apiCallFailedErrorMessage = 'VSTS User API Call Failed.';
        const jsonParseErrorMessage = 'Invalid or unexpected JSON encountered. Unable to determine VSTS Users.';

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
                vstsHelpersBuildRestApiBasicAuthRequestOptions.throws(new Error(vstsHelpersErrorMessageDetails));
                vstsGraphApiUserService.getAllUsers(accountName, pat).catch((err: Error) => {
                    assert.deepEqual(err.message, vstsHelpersErrorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the VSTS Helpers Request Options Helper throws an exception',
            async () => {
                    vstsHelpersBuildRestApiBasicAuthRequestOptions.throws(new Error(vstsHelpersErrorMessageDetails));
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
                    assert.deepEqual(err.message, errorMessage);
                    done();
                });
        });

        test('Should throw an error when awaited with the correct error message when the Request Get call throws an exception',
           async () => {
                requestGetStub.throws(new Error(errorMessageDetails));
                try {
                    await vstsGraphApiUserService.getAllUsers(accountName, pat);
                } catch (err) {
                    assert.deepEqual(err.message, errorMessage);
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

        test('Should return the correct collection Users when awaited when the Request Get call is successful',
           async () => {
                requestGetStub.yields(null, testHelpers.http200Response, testHelpers.mixedOriginVstsGraphUsersApiJson);
                const users = await vstsGraphApiUserService.getAllUsers(accountName, pat);
                assert.deepEqual(users, testHelpers.mixedOriginUsers);
        });
    });
});