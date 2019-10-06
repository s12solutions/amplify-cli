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
var path = require('path');
var hashElement = require('folder-hash').hashElement;
var pathManager = require('./path-manager');
var _a = require('./update-backend-config'), updateBackendConfigAfterResourceAdd = _a.updateBackendConfigAfterResourceAdd, updateBackendConfigDependsOn = _a.updateBackendConfigDependsOn;
var readJsonFile = require('./read-json-file').readJsonFile;
function updateAwsMetaFile(filePath, category, resourceName, attribute, value, timeStamp) {
    var amplifyMeta = readJsonFile(filePath);
    if (!amplifyMeta[category]) {
        amplifyMeta[category] = {};
        amplifyMeta[category][resourceName] = {};
    }
    else if (!amplifyMeta[category][resourceName]) {
        amplifyMeta[category][resourceName] = {};
    }
    if (!amplifyMeta[category][resourceName][attribute]) {
        amplifyMeta[category][resourceName][attribute] = {};
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
        if (!amplifyMeta[category][resourceName][attribute]) {
            amplifyMeta[category][resourceName][attribute] = {};
        }
        Object.assign(amplifyMeta[category][resourceName][attribute], value);
    }
    else {
        amplifyMeta[category][resourceName][attribute] = value;
    }
    if (timeStamp) {
        amplifyMeta[category][resourceName].lastPushTimeStamp = timeStamp;
    }
    var jsonString = JSON.stringify(amplifyMeta, null, 4);
    fs.writeFileSync(filePath, jsonString, 'utf8');
}
function moveBackendResourcesToCurrentCloudBackend(resources) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyCloudMetaFilePath = pathManager.getCurentAmplifyMetaFilePath();
    var backendConfigFilePath = pathManager.getBackendConfigFilePath();
    var backendConfigCloudFilePath = pathManager.getCurrentBackendConfigFilePath();
    for (var i = 0; i < resources.length; i += 1) {
        var sourceDir = path.normalize(path.join(pathManager.getBackendDirPath(), resources[i].category, resources[i].resourceName));
        var targetDir = path.normalize(path.join(pathManager.getCurrentCloudBackendDirPath(), resources[i].category, resources[i].resourceName));
        if (fs.pathExistsSync(targetDir)) {
            fs.removeSync(targetDir);
        }
        fs.ensureDirSync(targetDir);
        fs.copySync(sourceDir, targetDir);
    }
    fs.copySync(amplifyMetaFilePath, amplifyCloudMetaFilePath, { overwrite: true });
    fs.copySync(backendConfigFilePath, backendConfigCloudFilePath, { overwrite: true });
}
function updateamplifyMetaAfterResourceAdd(category, resourceName, options) {
    if (options === void 0) { options = {}; }
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    if (options.dependsOn) {
        checkForCyclicDependencies(category, resourceName, options.dependsOn);
    }
    if (!amplifyMeta[category]) {
        amplifyMeta[category] = {};
    }
    if (amplifyMeta[category][resourceName]) {
        throw new Error(resourceName + " is present in amplify-meta.json");
    }
    amplifyMeta[category][resourceName] = {};
    amplifyMeta[category][resourceName] = options;
    var jsonString = JSON.stringify(amplifyMeta, null, '\t');
    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
    updateBackendConfigAfterResourceAdd(category, resourceName, options);
}
function updateProvideramplifyMeta(providerName, options) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    if (!amplifyMeta.providers) {
        amplifyMeta.providers = {};
        amplifyMeta.providers[providerName] = {};
    }
    else if (!amplifyMeta.providers[providerName]) {
        amplifyMeta.providers[providerName] = {};
    }
    Object.keys(options).forEach(function (key) {
        amplifyMeta.providers[providerName][key] = options[key];
    });
    var jsonString = JSON.stringify(amplifyMeta, null, '\t');
    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
}
function updateamplifyMetaAfterResourceUpdate(category, resourceName, attribute, value) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    // let amplifyCloudMetaFilePath = pathManager.getCurentAmplifyMetaFilePath();
    var currentTimestamp = new Date();
    if (attribute === 'dependsOn') {
        checkForCyclicDependencies(category, resourceName, value);
    }
    updateAwsMetaFile(amplifyMetaFilePath, category, resourceName, attribute, value, currentTimestamp);
    if (['dependsOn', 'service'].includes(attribute)) {
        updateBackendConfigDependsOn(category, resourceName, attribute, value);
    }
}
function updateamplifyMetaAfterPush(resources) {
    return __awaiter(this, void 0, void 0, function () {
        var amplifyMetaFilePath, amplifyMeta, currentTimestamp, sourceDir, i, hashDir, jsonString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
                    amplifyMeta = readJsonFile(amplifyMetaFilePath);
                    currentTimestamp = new Date();
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < resources.length)) return [3 /*break*/, 4];
                    sourceDir = path.normalize(path.join(pathManager.getBackendDirPath(), resources[i].category, resources[i].resourceName));
                    return [4 /*yield*/, getHashForResourceDir(sourceDir)];
                case 2:
                    hashDir = _a.sent();
                    /*eslint-disable */
                    amplifyMeta[resources[i].category][resources[i].resourceName].lastPushTimeStamp = currentTimestamp;
                    amplifyMeta[resources[i].category][resources[i].resourceName].lastPushDirHash = hashDir;
                    _a.label = 3;
                case 3:
                    i += 1;
                    return [3 /*break*/, 1];
                case 4:
                    jsonString = JSON.stringify(amplifyMeta, null, '\t');
                    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
                    moveBackendResourcesToCurrentCloudBackend(resources);
                    return [2 /*return*/];
            }
        });
    });
}
function getHashForResourceDir(dirPath) {
    var options = {
        folders: { exclude: ['.*', 'node_modules', 'test_coverage'] },
    };
    return hashElement(dirPath, options)
        .then(function (result) { return result.hash; });
}
function updateamplifyMetaAfterBuild(resource) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    var currentTimestamp = new Date();
    /*eslint-disable */
    amplifyMeta[resource.category][resource.resourceName].lastBuildTimeStamp = currentTimestamp;
    /* eslint-enable */
    var jsonString = JSON.stringify(amplifyMeta, null, '\t');
    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
}
function updateAmplifyMetaAfterPackage(resource, zipFilename) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    var currentTimestamp = new Date();
    /*eslint-disable */
    amplifyMeta[resource.category][resource.resourceName].lastPackageTimeStamp = currentTimestamp;
    amplifyMeta[resource.category][resource.resourceName].distZipFilename = zipFilename;
    /* eslint-enable */
    var jsonString = JSON.stringify(amplifyMeta, null, '\t');
    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
}
function updateamplifyMetaAfterResourceDelete(category, resourceName) {
    var amplifyMetaFilePath = pathManager.getCurentAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    var resourceDir = path.normalize(path.join(pathManager.getCurrentCloudBackendDirPath(), category, resourceName));
    if (amplifyMeta[category] && amplifyMeta[category][resourceName] !== undefined) {
        delete amplifyMeta[category][resourceName];
    }
    var jsonString = JSON.stringify(amplifyMeta, null, '\t');
    fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
    fs.removeSync(resourceDir);
}
function checkForCyclicDependencies(category, resourceName, dependsOn) {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    var cyclicDependency = false;
    if (dependsOn) {
        dependsOn.forEach(function (resource) {
            if (resource.category === category && resource.resourceName === resourceName) {
                cyclicDependency = true;
            }
            if (amplifyMeta[resource.category] &&
                amplifyMeta[resource.category][resource.resourceName]) {
                var dependsOnResourceDependency = amplifyMeta[resource.category][resource.resourceName].dependsOn;
                if (dependsOnResourceDependency) {
                    dependsOnResourceDependency.forEach(function (dependsOnResource) {
                        if (dependsOnResource.category === category &&
                            dependsOnResource.resourceName === resourceName) {
                            cyclicDependency = true;
                        }
                    });
                }
            }
        });
    }
    if (cyclicDependency === true) {
        throw new Error("Cannot add " + resourceName + " due to a cyclic dependency");
    }
}
module.exports = {
    updateamplifyMetaAfterResourceAdd: updateamplifyMetaAfterResourceAdd,
    updateamplifyMetaAfterResourceUpdate: updateamplifyMetaAfterResourceUpdate,
    updateamplifyMetaAfterResourceDelete: updateamplifyMetaAfterResourceDelete,
    updateamplifyMetaAfterPush: updateamplifyMetaAfterPush,
    updateamplifyMetaAfterBuild: updateamplifyMetaAfterBuild,
    updateProvideramplifyMeta: updateProvideramplifyMeta,
    updateAmplifyMetaAfterPackage: updateAmplifyMetaAfterPackage,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/update-amplify-meta.js.map