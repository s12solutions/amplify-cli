"use strict";
function run(handle) {
    return new Promise(function (resolve) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        console.log(handle.message);
        process.stdin.once('data', function (data) {
            handle.data = data;
            resolve(handle);
        });
    });
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/press-enter-to-continue.js.map