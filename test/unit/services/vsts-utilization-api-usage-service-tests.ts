'use strict';

import Chai = require('chai');
import request = require('request');
import Sinon = require('sinon');

import testHelpers = require('./../test-helpers');
import VstsHelpers = require('./../../../src/vsts-helpers');
import VstsUsageRecord = require('./../../../src/models/vsts-usage-record');
import VstsUtilizationApiUsageService = require('./../../../src/services/vsts-utilization-api-usage-service');

const assert = Chai.assert;

suite('VstsUtilizationApiUsageService Suite:', () => {
    const sandbox: Sinon.SinonSandbox = Sinon.sandbox.create();
    // let requestGetStub: Sinon.SinonStub;
    let vstsUtilizationApiUsageService: VstsUtilizationApiUsageService;
    // let vstsHelpersBuildGraphApiUsersUrlStub: Sinon.SinonStub;
    // let vstsHelpersBuildRestApiBasicAuthRequestOptions: Sinon.SinonStub;
    const accountName = 'awesomeness';
    const pat = '1234567890abcdefghijklmnop';

    setup(() => {
        vstsUtilizationApiUsageService = new VstsUtilizationApiUsageService();
        // requestGetStub = sandbox.stub(request, 'get').callsFake(() => { return null; });
        // vstsHelpersBuildGraphApiUsersUrlStub = sandbox.stub(VstsHelpers, 'buildGraphApiUsersUrl').callsFake(() => { return null; })
        // vstsHelpersBuildRestApiBasicAuthRequestOptions =
        //     sandbox.stub(VstsHelpers, 'buildRestApiBasicAuthRequestOptions').callsFake(() => { return null; })
    });

    teardown(() => {
        sandbox.restore();
        vstsUtilizationApiUsageService = null;
    });

    test('Test', () => {
        vstsUtilizationApiUsageService.getUserActivityOnDate(null, null, null, null);
        assert.deepEqual(accountName, 'awesomeness');
        assert.deepEqual(pat, '1234567890abcdefghijklmnop');
    });
})