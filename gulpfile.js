/*eslint quotes: ["error", "single"]*/
// Related to: https://github.com/Microsoft/TypeScript/issues/13270
'use strict';

// All gulp tasks are located in the ./gulp_tasks/tasks directory
require('require-dir')('gulp_tasks/tasks');