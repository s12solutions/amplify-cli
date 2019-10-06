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
var getFrontendPlugins = require('../../extensions/amplify-helpers/get-frontend-plugins').getFrontendPlugins;
var getProviderPlugins = require('../../extensions/amplify-helpers/get-provider-plugins').getProviderPlugins;
var gitManager = require('../../extensions/amplify-helpers/git-manager');
var initializeEnv = require('../initialize-env').initializeEnv;
var readJsonFile = require('../../extensions/amplify-helpers/read-json-file').readJsonFile;
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectPath, amplify, amplifyDirPath, dotConfigDirPath, backendDirPath, currentBackendDirPath, currentAmplifyMetafilePath, currentAmplifyMeta, providerPlugins, providerOnSuccessTasks, frontendPlugins, frontendModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectPath = context.exeInfo.localEnvInfo.projectPath;
                    amplify = context.amplify;
                    amplifyDirPath = amplify.pathManager.getAmplifyDirPath(projectPath);
                    dotConfigDirPath = amplify.pathManager.getDotConfigDirPath(projectPath);
                    backendDirPath = amplify.pathManager.getBackendDirPath(projectPath);
                    currentBackendDirPath = amplify.pathManager.getCurrentCloudBackendDirPath(projectPath);
                    fs.ensureDirSync(amplifyDirPath);
                    fs.ensureDirSync(dotConfigDirPath);
                    fs.ensureDirSync(backendDirPath);
                    fs.ensureDirSync(currentBackendDirPath);
                    currentAmplifyMetafilePath = amplify.pathManager.getCurentAmplifyMetaFilePath();
                    currentAmplifyMeta = {};
                    if (fs.existsSync(currentAmplifyMetafilePath)) {
                        currentAmplifyMeta = readJsonFile(currentAmplifyMetafilePath);
                    }
                    providerPlugins = getProviderPlugins(context);
                    providerOnSuccessTasks = [];
                    frontendPlugins = getFrontendPlugins(context);
                    frontendModule = require(frontendPlugins[context.exeInfo.projectConfig.frontend]);
                    return [4 /*yield*/, frontendModule.onInitSuccessful(context)];
                case 1:
                    _a.sent();
                    generateLocalRuntimeFiles(context);
                    generateNonRuntimeFiles(context);
                    context.exeInfo.projectConfig.providers.forEach(function (provider) {
                        var providerModule = require(providerPlugins[provider]);
                        providerOnSuccessTasks.push(function () { return providerModule.onInitSuccessful(context); });
                    });
                    return [4 /*yield*/, sequential(providerOnSuccessTasks)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, initializeEnv(context, currentAmplifyMeta)];
                case 3:
                    _a.sent();
                    printWelcomeMessage(context);
                    return [2 /*return*/];
            }
        });
    });
}
function generateLocalRuntimeFiles(context) {
    generateLocalEnvInfoFile(context);
    generateAmplifyMetaFile(context);
}
function generateLocalEnvInfoFile(context) {
    var projectPath = context.exeInfo.localEnvInfo.projectPath;
    var jsonString = JSON.stringify(context.exeInfo.localEnvInfo, null, 4);
    var localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath(projectPath);
    fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
}
function generateAmplifyMetaFile(context) {
    if (context.exeInfo.isNewEnv) {
        var projectPath = context.exeInfo.localEnvInfo.projectPath;
        var jsonString = JSON.stringify(context.exeInfo.amplifyMeta, null, 4);
        var currentBackendMetaFilePath = context.amplify.pathManager.getCurentAmplifyMetaFilePath(projectPath);
        fs.writeFileSync(currentBackendMetaFilePath, jsonString, 'utf8');
        var backendMetaFilePath = context.amplify.pathManager.getAmplifyMetaFilePath(projectPath);
        fs.writeFileSync(backendMetaFilePath, jsonString, 'utf8');
    }
}
function generateNonRuntimeFiles(context) {
    generateProjectConfigFile(context);
    generateBackendConfigFile(context);
    generateProviderInfoFile(context);
    generateGitIgnoreFile(context);
}
function generateProjectConfigFile(context) {
    // won't modify on new env
    if (context.exeInfo.isNewProject) {
        var projectPath = context.exeInfo.localEnvInfo.projectPath;
        var jsonString = JSON.stringify(context.exeInfo.projectConfig, null, 4);
        var projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath(projectPath);
        fs.writeFileSync(projectConfigFilePath, jsonString, 'utf8');
    }
}
function generateProviderInfoFile(context) {
    var projectPath = context.exeInfo.localEnvInfo.projectPath;
    var teamProviderInfo = {};
    var providerInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath(projectPath);
    if (fs.existsSync(providerInfoFilePath)) {
        teamProviderInfo = readJsonFile(providerInfoFilePath);
        Object.assign(teamProviderInfo, context.exeInfo.teamProviderInfo);
    }
    else {
        (teamProviderInfo = context.exeInfo.teamProviderInfo);
    }
    var jsonString = JSON.stringify(teamProviderInfo, null, 4);
    fs.writeFileSync(providerInfoFilePath, jsonString, 'utf8');
}
function generateBackendConfigFile(context) {
    if (context.exeInfo.isNewProject) {
        var projectPath = context.exeInfo.localEnvInfo.projectPath;
        var backendConfigFilePath = context.amplify.pathManager.getBackendConfigFilePath(projectPath);
        fs.writeFileSync(backendConfigFilePath, '{}', 'utf8');
    }
}
function generateGitIgnoreFile(context) {
    if (context.exeInfo.isNewProject) {
        var projectPath = context.exeInfo.localEnvInfo.projectPath;
        var gitIgnoreFilePath = context.amplify.pathManager.getGitIgnoreFilePath(projectPath);
        gitManager.insertAmplifyIgnore(gitIgnoreFilePath);
    }
}
function printWelcomeMessage(context) {
    context.print.info('');
    context.print.success('Your project has been successfully initialized and connected to the cloud!');
    context.print.info('');
    context.print.success('Some next steps:');
    context.print.info("\"amplify status\" will show you what you've added already and if it's locally configured or deployed");
    context.print.info('"amplify <category> add" will allow you to add features like user login or a backend API');
    context.print.info('"amplify push" will build all your local backend resources and provision it in the cloud');
    context.print.info('"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud');
    context.print.info('');
    context.print.success('Pro tip:');
    context.print.info('Try "amplify add api" to create a backend API and then "amplify publish" to deploy everything');
    context.print.info('');
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/s9-onSuccess.js.map