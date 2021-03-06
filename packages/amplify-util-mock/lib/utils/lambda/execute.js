"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path = require('path');
function loadFunction(fileName) {
    return require(path.resolve(fileName));
}
function invokeFunction(options) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let returned = false;
        const context = {
            done(error, result) {
                if (!returned) {
                    returned = true;
                    if (error === null || typeof error === 'undefined') {
                        context.succeed(result);
                    }
                    else {
                        context.fail(error);
                    }
                }
            },
            succeed(result) {
                returned = true;
                resolve(result);
            },
            fail(error) {
                returned = true;
                reject(error);
            },
            awsRequestId: 'LAMBDA_INVOKE',
            logStreamName: 'LAMBDA_INVOKE',
        };
        if (options.packageFolder) {
            const p = path.resolve(options.packageFolder);
            if (!fs_extra_1.existsSync(p)) {
                context.fail('packageFolder does not exist');
                return;
            }
            process.chdir(p);
        }
        else {
            context.fail('packageFolder is not defined');
            return;
        }
        if (!options.handler) {
            context.fail('handler is not defined');
            return;
        }
        if (options.context) {
            Object.assign(context, options.context);
        }
        const callback = (error, object) => {
            context.done(error, object);
        };
        const lambda = loadFunction(options.fileName);
        const { event } = options;
        try {
            if (!lambda[options.handler]) {
                context.fail(`handler ${options.handler} does not exist in the lambda function ${path.join(options.packageFolder, options.fileName)}`);
                return;
            }
            const result = yield lambda[options.handler](event, context, callback);
            if (result !== undefined) {
                context.done(null, result);
            }
        }
        catch (e) {
            context.done(e, null);
        }
    }));
}
process.on('message', (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield invokeFunction(JSON.parse(options));
        process.send(JSON.stringify({ result, error: null }));
    }
    catch (error) {
        process.send(JSON.stringify({ result: null, error }));
        process.exit(1);
    }
}));
//# sourceMappingURL=execute.js.map