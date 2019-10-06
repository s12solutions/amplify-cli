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
var fs = require('fs-extra');
var getProjectConfig = require('./get-project-config').getProjectConfig;
var showResourceTable = require('./resource-status').showResourceTable;
var onCategoryOutputsChange = require('./on-category-outputs-change').onCategoryOutputsChange;
var initializeEnv = require('../../lib/initialize-env').initializeEnv;
var getProviderPlugins = require('./get-provider-plugins').getProviderPlugins;
var getEnvInfo = require('./get-env-info').getEnvInfo;
var readJsonFile = require('./read-json-file').readJsonFile;
/*
context: Object // Required
category: String // Optional
resourceName: String // Optional
filteredResources: [{category: String, resourceName: String}] // Optional
*/
function pushResources(context, category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function () {
        var envName_1, allEnvs, projectConfigFilePath, jsonString, localEnvFilePath, hasChanges, continueToPush, currentAmplifyMetaFilePath, currentAmplifyMeta, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!context.parameters.options.env) return [3 /*break*/, 3];
                    envName_1 = context.parameters.options.env;
                    allEnvs = context.amplify.getAllEnvs(context);
                    if (!(allEnvs.findIndex(function (env) { return env === envName_1; }) !== -1)) return [3 /*break*/, 2];
                    context.exeInfo = {};
                    context.exeInfo.forcePush = false;
                    projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath();
                    if (fs.existsSync(projectConfigFilePath)) {
                        context.exeInfo.projectConfig = readJsonFile(projectConfigFilePath);
                    }
                    context.exeInfo.localEnvInfo = getEnvInfo();
                    if (context.exeInfo.localEnvInfo.envName !== envName_1) {
                        context.exeInfo.localEnvInfo.envName = envName_1;
                        jsonString = JSON.stringify(context.exeInfo.localEnvInfo, null, 4);
                        localEnvFilePath = context
                            .amplify
                            .pathManager
                            .getLocalEnvFilePath(context.exeInfo.localEnvInfo.projectPath);
                        fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
                    }
                    return [4 /*yield*/, initializeEnv(context)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    context.print.error("Environment doesn't exist. Please use 'amplify init' to create a new environment");
                    process.exit(1);
                    _a.label = 3;
                case 3: return [4 /*yield*/, showResourceTable(category, resourceName, filteredResources)];
                case 4:
                    hasChanges = _a.sent();
                    // no changes detected
                    if (!hasChanges && !context.exeInfo.forcePush) {
                        context.print.info('\nNo changes detected');
                        return [2 /*return*/, context];
                    }
                    continueToPush = context.exeInfo && context.exeInfo.inputParams && context.exeInfo.inputParams.yes;
                    if (!!continueToPush) return [3 /*break*/, 6];
                    return [4 /*yield*/, context.amplify.confirmPrompt.run('Are you sure you want to continue?')];
                case 5:
                    continueToPush = _a.sent();
                    _a.label = 6;
                case 6:
                    if (!continueToPush) return [3 /*break*/, 11];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 10, , 11]);
                    currentAmplifyMetaFilePath = context.amplify.pathManager.getCurentAmplifyMetaFilePath();
                    currentAmplifyMeta = readJsonFile(currentAmplifyMetaFilePath);
                    return [4 /*yield*/, providersPush(context, category, resourceName, filteredResources)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, onCategoryOutputsChange(context, currentAmplifyMeta)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    err_1 = _a.sent();
                    // Handle the errors and print them nicely for the user.
                    context.print.error("\n" + err_1.message);
                    throw err_1;
                case 11: return [2 /*return*/, continueToPush];
            }
        });
    });
}
function providersPush(context, category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function () {
        var providers, providerPlugins, providerPromises, i, providerModule, resourceDefiniton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providers = getProjectConfig().providers;
                    providerPlugins = getProviderPlugins(context);
                    providerPromises = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < providers.length)) return [3 /*break*/, 4];
                    providerModule = require(providerPlugins[providers[i]]);
                    return [4 /*yield*/, context.amplify.getResourceStatus(category, resourceName, providers[i], filteredResources)];
                case 2:
                    resourceDefiniton = _a.sent();
                    providerPromises.push(providerModule.pushResources(context, resourceDefiniton));
                    _a.label = 3;
                case 3:
                    i += 1;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, Promise.all(providerPromises)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    pushResources: pushResources,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/push-resources.js.map