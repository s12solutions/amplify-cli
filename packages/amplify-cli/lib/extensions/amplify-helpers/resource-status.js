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
var path = require('path');
var print = require('./print');
var chalk = require('chalk');
var hashElement = require('folder-hash').hashElement;
var pathManager = require('./path-manager');
var getEnvInfo = require('./get-env-info').getEnvInfo;
var _ = require('lodash');
var readJsonFile = require('./read-json-file').readJsonFile;
function isBackendDirModifiedSinceLastPush(resourceName, category, lastPushTimeStamp) {
    return __awaiter(this, void 0, void 0, function () {
        var localBackendDir, cloudBackendDir, localDirHash, cloudDirHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Pushing the resource for the first time hence no lastPushTimeStamp
                    if (!lastPushTimeStamp) {
                        return [2 /*return*/, false];
                    }
                    localBackendDir = path.normalize(path.join(pathManager.getBackendDirPath(), category, resourceName));
                    cloudBackendDir = path.normalize(path.join(pathManager.getCurrentCloudBackendDirPath(), category, resourceName));
                    if (!fs.existsSync(localBackendDir)) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, getHashForResourceDir(localBackendDir)];
                case 1:
                    localDirHash = _a.sent();
                    return [4 /*yield*/, getHashForResourceDir(cloudBackendDir)];
                case 2:
                    cloudDirHash = _a.sent();
                    if (localDirHash !== cloudDirHash) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
function getHashForResourceDir(dirPath) {
    var options = {
        folders: { exclude: ['.*', 'node_modules', 'test_coverage', 'dist', 'build'] },
    };
    return hashElement(dirPath, options)
        .then(function (result) { return result.hash; });
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function filterResources(resources, filteredResources) {
    if (!filteredResources) {
        return resources;
    }
    resources = resources.filter(function (resource) {
        var common = false;
        for (var i = 0; i < filteredResources.length; i += 1) {
            if (filteredResources[i].category === resource.category
                && filteredResources[i].resourceName === resource.resourceName) {
                common = true;
                break;
            }
        }
        if (common === true) {
            return true;
        }
        return false;
    });
    return resources;
}
function getAllResources(amplifyMeta, category, resourceName, filteredResources) {
    var resources = [];
    Object.keys((amplifyMeta)).forEach(function (categoryName) {
        var categoryItem = amplifyMeta[categoryName];
        Object.keys((categoryItem)).forEach(function (resource) {
            amplifyMeta[categoryName][resource].resourceName = resource;
            amplifyMeta[categoryName][resource].category = categoryName;
            resources.push(amplifyMeta[categoryName][resource]);
        });
    });
    resources = filterResources(resources, filteredResources);
    if (category !== undefined && resourceName !== undefined) {
        // Create only specified resource in the cloud
        resources = resources.filter(function (resource) { return resource.category === category &&
            resource.resourceName === resourceName; });
    }
    if (category !== undefined && !resourceName) {
        // Create all the resources for the specified category in the cloud
        resources = resources.filter(function (resource) { return resource.category === category; });
    }
    return resources;
}
function getResourcesToBeCreated(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources) {
    var resources = [];
    Object.keys((amplifyMeta)).forEach(function (categoryName) {
        var categoryItem = amplifyMeta[categoryName];
        Object.keys((categoryItem)).forEach(function (resource) {
            if ((!amplifyMeta[categoryName][resource].lastPushTimeStamp ||
                !currentamplifyMeta[categoryName] ||
                !currentamplifyMeta[categoryName][resource]) &&
                categoryName !== 'providers') {
                amplifyMeta[categoryName][resource].resourceName = resource;
                amplifyMeta[categoryName][resource].category = categoryName;
                resources.push(amplifyMeta[categoryName][resource]);
            }
        });
    });
    resources = filterResources(resources, filteredResources);
    if (category !== undefined && resourceName !== undefined) {
        // Create only specified resource in the cloud
        resources = resources.filter(function (resource) { return resource.category === category &&
            resource.resourceName === resourceName; });
    }
    if (category !== undefined && !resourceName) {
        // Create all the resources for the specified category in the cloud
        resources = resources.filter(function (resource) { return resource.category === category; });
    }
    // Check for dependencies and add them
    for (var i = 0; i < resources.length; i += 1) {
        if (resources[i].dependsOn && resources[i].dependsOn.length > 0) {
            for (var j = 0; j < resources[i].dependsOn.length; j += 1) {
                var dependsOnCategory = resources[i].dependsOn[j].category;
                var dependsOnResourcename = resources[i].dependsOn[j].resourceName;
                if ((!amplifyMeta[dependsOnCategory][dependsOnResourcename].lastPushTimeStamp ||
                    !currentamplifyMeta[dependsOnCategory] ||
                    !currentamplifyMeta[dependsOnCategory][dependsOnResourcename])) {
                    resources.push(amplifyMeta[dependsOnCategory][dependsOnResourcename]);
                }
            }
        }
    }
    return _.uniqWith(resources, _.isEqual);
}
function getResourcesToBeDeleted(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources) {
    var resources = [];
    Object.keys((currentamplifyMeta)).forEach(function (categoryName) {
        var categoryItem = currentamplifyMeta[categoryName];
        Object.keys((categoryItem)).forEach(function (resource) {
            if (!amplifyMeta[categoryName] || !amplifyMeta[categoryName][resource]) {
                currentamplifyMeta[categoryName][resource].resourceName = resource;
                currentamplifyMeta[categoryName][resource].category = categoryName;
                resources.push(currentamplifyMeta[categoryName][resource]);
            }
        });
    });
    resources = filterResources(resources, filteredResources);
    if (category !== undefined && resourceName !== undefined) {
        // Deletes only specified resource in the cloud
        resources = resources.filter(function (resource) { return resource.category === category &&
            resource.resourceName === resourceName; });
    }
    if (category !== undefined && !resourceName) {
        // Deletes all the resources for the specified category in the cloud
        resources = resources.filter(function (resource) { return resource.category === category; });
    }
    return resources;
}
function getResourcesToBeUpdated(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function () {
        var resources;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resources = [];
                    return [4 /*yield*/, asyncForEach(Object.keys((amplifyMeta)), function (categoryName) { return __awaiter(_this, void 0, void 0, function () {
                            var categoryItem;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        categoryItem = amplifyMeta[categoryName];
                                        return [4 /*yield*/, asyncForEach(Object.keys((categoryItem)), function (resource) { return __awaiter(_this, void 0, void 0, function () {
                                                var backendModified;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!currentamplifyMeta[categoryName]) return [3 /*break*/, 2];
                                                            if (!(currentamplifyMeta[categoryName][resource] !== undefined &&
                                                                amplifyMeta[categoryName][resource] !== undefined)) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, isBackendDirModifiedSinceLastPush(resource, categoryName, currentamplifyMeta[categoryName][resource].lastPushTimeStamp)];
                                                        case 1:
                                                            backendModified = _a.sent();
                                                            if (backendModified) {
                                                                amplifyMeta[categoryName][resource].resourceName = resource;
                                                                amplifyMeta[categoryName][resource].category = categoryName;
                                                                resources.push(amplifyMeta[categoryName][resource]);
                                                            }
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    resources = filterResources(resources, filteredResources);
                    if (category !== undefined && resourceName !== undefined) {
                        resources = resources.filter(function (resource) { return resource.category === category &&
                            resource.resourceName === resourceName; });
                    }
                    if (category !== undefined && !resourceName) {
                        resources = resources.filter(function (resource) { return resource.category === category; });
                    }
                    return [2 /*return*/, resources];
            }
        });
    });
}
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(array[index], index, array)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index += 1;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getResourceStatus(category, resourceName, providerName, filteredResources) {
    return __awaiter(this, void 0, void 0, function () {
        var amplifyMetaFilePath, amplifyMeta, currentamplifyMetaFilePath, currentamplifyMeta, resourcesToBeCreated, resourcesToBeUpdated, resourcesToBeDeleted, allResources;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
                    amplifyMeta = readJsonFile(amplifyMetaFilePath);
                    currentamplifyMetaFilePath = pathManager.getCurentAmplifyMetaFilePath();
                    currentamplifyMeta = readJsonFile(currentamplifyMetaFilePath);
                    resourcesToBeCreated = getResourcesToBeCreated(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources);
                    return [4 /*yield*/, getResourcesToBeUpdated(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources)];
                case 1:
                    resourcesToBeUpdated = _a.sent();
                    resourcesToBeDeleted = getResourcesToBeDeleted(amplifyMeta, currentamplifyMeta, category, resourceName, filteredResources);
                    allResources = getAllResources(amplifyMeta, category, resourceName, filteredResources);
                    resourcesToBeCreated = resourcesToBeCreated.filter(function (resource) { return resource.category !== 'provider'; });
                    if (providerName) {
                        resourcesToBeCreated = resourcesToBeCreated.filter(function (resource) {
                            return resource.providerPlugin === providerName;
                        });
                        resourcesToBeUpdated = resourcesToBeUpdated.filter(function (resource) {
                            return resource.providerPlugin === providerName;
                        });
                        resourcesToBeDeleted = resourcesToBeDeleted.filter(function (resource) {
                            return resource.providerPlugin === providerName;
                        });
                        allResources = allResources.filter(function (resource) {
                            return resource.providerPlugin === providerName;
                        });
                    }
                    return [2 /*return*/, {
                            resourcesToBeCreated: resourcesToBeCreated, resourcesToBeUpdated: resourcesToBeUpdated, resourcesToBeDeleted: resourcesToBeDeleted, allResources: allResources,
                        }];
            }
        });
    });
}
function showResourceTable(category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function () {
        var envName, _a, resourcesToBeCreated, resourcesToBeUpdated, resourcesToBeDeleted, allResources, noChangeResources, createOperationLabel, updateOperationLabel, deleteOperationLabel, noOperationLabel, tableOptions, i, i, i, i, table, changedResourceCount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    envName = getEnvInfo().envName;
                    print.info('');
                    print.info(chalk.green('Current Environment') + ": " + envName);
                    print.info('');
                    return [4 /*yield*/, getResourceStatus(category, resourceName, undefined, filteredResources)];
                case 1:
                    _a = _b.sent(), resourcesToBeCreated = _a.resourcesToBeCreated, resourcesToBeUpdated = _a.resourcesToBeUpdated, resourcesToBeDeleted = _a.resourcesToBeDeleted, allResources = _a.allResources;
                    noChangeResources = _.differenceWith(allResources, resourcesToBeCreated.concat(resourcesToBeUpdated), _.isEqual);
                    noChangeResources = noChangeResources.filter(function (resource) { return resource.category !== 'providers'; });
                    createOperationLabel = 'Create';
                    updateOperationLabel = 'Update';
                    deleteOperationLabel = 'Delete';
                    noOperationLabel = 'No Change';
                    tableOptions = [['Category', 'Resource name', 'Operation', 'Provider plugin']];
                    for (i = 0; i < resourcesToBeCreated.length; i += 1) {
                        tableOptions.push([
                            capitalize(resourcesToBeCreated[i].category),
                            resourcesToBeCreated[i].resourceName,
                            createOperationLabel,
                            resourcesToBeCreated[i].providerPlugin
                        ]);
                    }
                    for (i = 0; i < resourcesToBeUpdated.length; i += 1) {
                        tableOptions.push([
                            capitalize(resourcesToBeUpdated[i].category),
                            resourcesToBeUpdated[i].resourceName,
                            updateOperationLabel,
                            resourcesToBeUpdated[i].providerPlugin
                        ]);
                    }
                    for (i = 0; i < resourcesToBeDeleted.length; i += 1) {
                        tableOptions.push([
                            capitalize(resourcesToBeDeleted[i].category),
                            resourcesToBeDeleted[i].resourceName,
                            deleteOperationLabel,
                            resourcesToBeDeleted[i].providerPlugin
                        ]);
                    }
                    for (i = 0; i < noChangeResources.length; i += 1) {
                        tableOptions.push([
                            capitalize(noChangeResources[i].category),
                            noChangeResources[i].resourceName,
                            noOperationLabel,
                            noChangeResources[i].providerPlugin
                        ]);
                    }
                    table = print.table;
                    table(tableOptions, { format: 'markdown' });
                    changedResourceCount = resourcesToBeCreated.length + resourcesToBeUpdated.length + resourcesToBeDeleted.length;
                    return [2 /*return*/, changedResourceCount];
            }
        });
    });
}
module.exports = {
    getResourceStatus: getResourceStatus,
    showResourceTable: showResourceTable,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/resource-status.js.map