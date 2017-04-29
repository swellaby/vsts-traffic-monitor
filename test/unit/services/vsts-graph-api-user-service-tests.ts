'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import testHelpers = require('./../test-helpers');
import VstsGraphApiUserService = require('./../../../src/services/vsts-graph-api-user-service');
import VstsUser = require('./../../../src/models/vsts-user');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsGraphApiUserService} class defined in ./src/services/vsts-graph-api-user-service.ts
 */
suite('VSTS Graph API User Service Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let requestGetStub: Sinon.SinonStub;
    let vstsGraphApiUserService: VstsGraphApiUserService;

    setup(() => {
        requestGetStub = sandbox.stub(request, 'get');
        vstsGraphApiUserService = new VstsGraphApiUserService();
    });

    teardown(() => {
        sandbox.restore();
        vstsGraphApiUserService = null;
    });

    suite('getAADUsers Suite:', () => {
        const errorMessageBase = 'Encountered an error while retrieving VSTS users from AAD. Error details: ';
        const errorMessageDetails = '';
        const errorMessage = errorMessageBase + errorMessageDetails;
    });

    suite('getAllUsers Suite:', () => {

    });
});