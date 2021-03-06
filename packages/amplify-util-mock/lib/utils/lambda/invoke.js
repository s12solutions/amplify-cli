"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = require("path");
function invoke(options) {
    return new Promise((resolve, reject) => {
        try {
            // XXX: Make the path work in both e2e and
            const lambdaFn = child_process_1.fork(path.join(__dirname, '../../../lib/utils/lambda', 'execute.js'), [], {
                execArgv: [],
                env: options.environment || {},
            });
            lambdaFn.on('message', msg => {
                const result = JSON.parse(msg);
                if (result.error) {
                    reject(result.error);
                }
                resolve(result.result);
            });
            lambdaFn.send(JSON.stringify(options));
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.invoke = invoke;
//# sourceMappingURL=invoke.js.map