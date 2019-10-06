"use strict";
var print = require('../../extensions/amplify-helpers/print');
var util = require('util');
function run(e) {
    print.error('Error occured during configuration.');
    print.info(util.inspect(e));
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c9-onFailure.js.map