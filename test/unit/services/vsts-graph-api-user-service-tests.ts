'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import VstsGraphApiUserService = require('./../../../src/services/vsts-graph-api-user-service');
import VstsUser = require('./../../../src/models/vsts-user');

const assert = Chai.assert;

/**
 * Contains unit tests for the @see {@link VstsGraphApiUserService} class defined in ./src/services/vsts-graph-api-user-service.ts
 */
suite('VSTS Graph API User Service Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    let requestGetStub: Sinon.SinonStub;

    setup(() => {
        requestGetStub = sandbox.stub(request, 'get');
    });

    teardown(() => {
        sandbox.restore();
    });
});