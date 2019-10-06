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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs');
var sequential = require('promise-sequential');
var initializeEnv = require('../../lib/initialize-env').initializeEnv;
var getProviderPlugins = require('../../extensions/amplify-helpers/get-provider-plugins').getProviderPlugins;
var getEnvInfo = require('../../extensions/amplify-helpers/get-env-info').getEnvInfo;
module.exports = {
    name: 'checkout',
    run: function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var envName, allEnvs, localEnvFilePath, localEnvInfo, jsonString, initializationTasks, providerPlugins, onInitSuccessfulTasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    envName = context.parameters.first;
                    allEnvs = context.amplify.getEnvDetails();
                    if (!envName || !allEnvs[envName]) {
                        context.print.error('Please pass in a valid environment name. Run amplify env list to get a list of valid environments');
                        return [2 /*return*/];
                    }
                    localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath();
                    localEnvInfo = getEnvInfo();
                    localEnvInfo.envName = envName;
                    jsonString = JSON.stringify(localEnvInfo, null, 4);
                    fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
                    // Setup exeinfo
                    context.amplify.constructExeInfo(context);
                    context.exeInfo.forcePush = false;
                    context.exeInfo.isNewEnv = false;
                    context.exeInfo.restoreBackend = context.parameters.options.restore;
                    initializationTasks = [];
                    providerPlugins = getProviderPlugins(context);
                    context.exeInfo.projectConfig.providers.forEach(function (provider) {
                        var providerModule = require(providerPlugins[provider]);
                        initializationTasks.push(function () { return providerModule.init(context, allEnvs[envName][provider]); });
                    });
                    return [4 /*yield*/, sequential(initializationTasks)];
                case 1:
                    _a.sent();
                    onInitSuccessfulTasks = [];
                    context.exeInfo.projectConfig.providers.forEach(function (provider) {
                        var providerModule = require(providerPlugins[provider]);
                        onInitSuccessfulTasks.push(function () { return providerModule.onInitSuccessful(context, allEnvs[envName][provider]); });
                    });
                    return [4 /*yield*/, sequential(onInitSuccessfulTasks)];
                case 2:
                    _a.sent();
                    // Initialize the environment
                    return [4 /*yield*/, initializeEnv(context)];
                case 3:
                    // Initialize the environment
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
};
//# sourceMappingURL=../../../src/lib/commands/env/checkout.js.map