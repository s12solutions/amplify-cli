"use strict";
var print = require('../../extensions/amplify-helpers/print');
var util = require('util');
function run(e) {
    print.error('init failed');
    print.info(util.inspect(e));
    // Exit the process with a failure code
    process.exit(1);
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/s9-onFailure.js.map