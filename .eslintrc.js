'use strict';

module.exports = {
    extends: '@swellaby/eslint-config/lib/bundles/ts-node',
    overrides: [
        {
            files: [
                'test/unit/services/**.js'
            ],
            rules: {
                'max-len': [
                    'error',
                    {
                        code: 230
                    }
                ]
            }
        }
    ],
};
