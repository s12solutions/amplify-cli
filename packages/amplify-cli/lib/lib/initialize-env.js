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
var sequential = require('promise-sequential');
var ora = require('ora');
var readJsonFile = require('../extensions/amplify-helpers/read-json-file').readJsonFile;
var spinner = ora('');
var getProviderPlugins = require('../extensions/amplify-helpers/get-provider-plugins').getProviderPlugins;
function initializeEnv(context, currentAmplifyMeta) {
    return __awaiter(this, void 0, void 0, function () {
        var currentEnv, projectPath, providerInfoFilePath, amplifyMeta_1, currentAmplifyMetafilePath, categoryInitializationTasks_1, initializedCategories_1, categoryPlugins_1, availableCategory, providerPlugins_1, initializationTasks_1, providerPushTasks, projectDetails, _a, _loop_1, i, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentEnv = context.exeInfo.localEnvInfo.envName;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 13, , 14]);
                    projectPath = context.exeInfo.localEnvInfo.projectPath;
                    providerInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath(projectPath);
                    amplifyMeta_1 = {};
                    amplifyMeta_1.providers = readJsonFile(providerInfoFilePath)[currentEnv];
                    if (!currentAmplifyMeta) {
                        currentAmplifyMetafilePath = context.amplify.pathManager.getCurentAmplifyMetaFilePath();
                        if (fs.existsSync(currentAmplifyMetafilePath)) {
                            currentAmplifyMeta = readJsonFile(currentAmplifyMetafilePath);
                        }
                    }
                    if (!context.exeInfo.restoreBackend) {
                        populateAmplifyMeta(context, amplifyMeta_1);
                    }
                    categoryInitializationTasks_1 = [];
                    initializedCategories_1 = Object.keys(context.amplify.getProjectMeta());
                    categoryPlugins_1 = context.amplify.getCategoryPlugins(context);
                    availableCategory = Object.keys(categoryPlugins_1).filter(function (key) {
                        return initializedCategories_1.includes(key);
                    });
                    availableCategory.forEach(function (category) {
                        try {
                            var initEnv_1 = require(categoryPlugins_1[category]).initEnv;
                            if (initEnv_1) {
                                categoryInitializationTasks_1.push(function () { return initEnv_1(context); });
                            }
                        }
                        catch (e) {
                            context.print.warning("Could not run initEnv for " + category);
                        }
                    });
                    providerPlugins_1 = getProviderPlugins(context);
                    initializationTasks_1 = [];
                    providerPushTasks = [];
                    context.exeInfo.projectConfig.providers.forEach(function (provider) {
                        var providerModule = require(providerPlugins_1[provider]);
                        initializationTasks_1.push(function () { return providerModule.initEnv(context, amplifyMeta_1.providers[provider]); });
                    });
                    spinner.start("Initializing your environment: " + currentEnv);
                    return [4 /*yield*/, sequential(initializationTasks_1)];
                case 2:
                    _b.sent();
                    spinner.succeed('Initialized provider successfully.');
                    projectDetails = context.amplify.getProjectDetails();
                    context.exeInfo = context.exeInfo || {};
                    Object.assign(context.exeInfo, projectDetails);
                    return [4 /*yield*/, sequential(categoryInitializationTasks_1)];
                case 3:
                    _b.sent();
                    if (!(context.exeInfo.forcePush === undefined)) return [3 /*break*/, 5];
                    _a = context.exeInfo;
                    return [4 /*yield*/, context.amplify.confirmPrompt.run('Do you want to push your resources to the cloud for your environment?')];
                case 4:
                    _a.forcePush = _b.sent();
                    _b.label = 5;
                case 5:
                    if (!context.exeInfo.forcePush) return [3 /*break*/, 11];
                    _loop_1 = function (i) {
                        var provider, providerModule, resourceDefiniton;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    provider = context.exeInfo.projectConfig.providers[i];
                                    providerModule = require(providerPlugins_1[provider]);
                                    return [4 /*yield*/, context.amplify.getResourceStatus(undefined, undefined, provider)];
                                case 1:
                                    resourceDefiniton = _a.sent();
                                    providerPushTasks.push(function () { return providerModule.pushResources(context, resourceDefiniton); });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _b.label = 6;
                case 6:
                    if (!(i < context.exeInfo.projectConfig.providers.length)) return [3 /*break*/, 9];
                    return [5 /*yield**/, _loop_1(i)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    i += 1;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, sequential(providerPushTasks)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: 
                // Generate AWS exports/configurtion file
                return [4 /*yield*/, context.amplify.onCategoryOutputsChange(context, currentAmplifyMeta)];
                case 12:
                    // Generate AWS exports/configurtion file
                    _b.sent();
                    context.print.success('Initialized your environment successfully.');
                    return [3 /*break*/, 14];
                case 13:
                    e_1 = _b.sent();
                    spinner.fail('There was an error initializing your environment.');
                    throw e_1;
                case 14: return [2 /*return*/];
            }
        });
    });
}
function populateAmplifyMeta(context, amplifyMeta) {
    var projectPath = context.exeInfo.localEnvInfo.projectPath;
    var backendConfigFilePath = context.amplify.pathManager.getBackendConfigFilePath(projectPath);
    var backendResourceInfo = readJsonFile(backendConfigFilePath);
    Object.assign(amplifyMeta, backendResourceInfo);
    var backendMetaFilePath = context.amplify.pathManager.getAmplifyMetaFilePath(projectPath);
    var jsonString = JSON.stringify(amplifyMeta, null, 4);
    fs.writeFileSync(backendMetaFilePath, jsonString, 'utf8');
}
module.exports = {
    initializeEnv: initializeEnv,
};
//# sourceMappingURL=../../src/lib/lib/initialize-env.js.map