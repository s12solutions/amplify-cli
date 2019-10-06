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
var inquirer = require('inquirer');
var pathManager = require('./path-manager');
var updateBackendConfigAfterResourceRemove = require('./update-backend-config').updateBackendConfigAfterResourceRemove;
var removeResourceParameters = require('./envResourceParams').removeResourceParameters;
function forceRemoveResource(context, category, name, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var amplifyMetaFilePath, amplifyMeta, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
                    amplifyMeta = JSON.parse(fs.readFileSync(amplifyMetaFilePath));
                    if (!amplifyMeta[category] || Object.keys(amplifyMeta[category]).length === 0) {
                        context.print.error('No resources added for this category');
                        process.exit(1);
                        return [2 /*return*/];
                    }
                    if (!context || !category || !name || !dir) {
                        context.print.error('Unable to force removal of resource: missing parameters');
                        process.exit(1);
                        return [2 /*return*/];
                    }
                    context.print.info("Removing resource " + name + "...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteResourceFiles(context, category, name, dir, true)];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    context.print.error('Unable to force removal of resource: error deleting files');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, response];
            }
        });
    });
}
function removeResource(context, category) {
    var _this = this;
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = JSON.parse(fs.readFileSync(amplifyMetaFilePath));
    if (!amplifyMeta[category] || Object.keys(amplifyMeta[category]).length === 0) {
        context.print.error('No resources added for this category');
        process.exit(1);
        return;
    }
    var resources = Object.keys(amplifyMeta[category]);
    var question = [{
            name: 'resource',
            message: 'Choose the resource you would want to remove',
            type: 'list',
            choices: resources,
        }];
    return inquirer.prompt(question)
        .then(function (answer) {
        var resourceName = answer.resource;
        var resourceDir = path.normalize(path.join(pathManager.getBackendDirPath(), category, resourceName));
        return context.amplify.confirmPrompt.run('Are you sure you want to delete the resource? This action deletes all files related to this resource from the backend directory.')
            .then(function (confirm) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (confirm) {
                    return [2 /*return*/, deleteResourceFiles(context, category, resourceName, resourceDir)];
                }
                return [2 /*return*/];
            });
        }); });
    })
        .catch(function (err) {
        context.print.info(err.stack);
        context.print.error('An error occurred when removing the resources from the local directory');
    });
}
var deleteResourceFiles = function (context, category, resourceName, resourceDir, force) { return __awaiter(void 0, void 0, void 0, function () {
    var amplifyMetaFilePath, amplifyMeta, allResources, resourceValues, jsonString;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
                amplifyMeta = JSON.parse(fs.readFileSync(amplifyMetaFilePath));
                if (!!force) return [3 /*break*/, 2];
                return [4 /*yield*/, context.amplify.getResourceStatus()];
            case 1:
                allResources = (_a.sent()).allResources;
                allResources.forEach(function (resourceItem) {
                    if (resourceItem.dependsOn) {
                        resourceItem.dependsOn.forEach(function (dependsOnItem) {
                            if (dependsOnItem.category === category &&
                                dependsOnItem.resourceName === resourceName) {
                                context.print.error('Resource cannot be removed because it has a dependency on another resource');
                                context.print.error("Dependency: " + resourceItem.service + ":" + resourceItem.resourceName);
                                throw new Error('Resource cannot be removed because it has a dependency on another resource');
                            }
                        });
                    }
                });
                _a.label = 2;
            case 2:
                resourceValues = {
                    service: amplifyMeta[category][resourceName].service,
                    resourceName: resourceName,
                };
                if (amplifyMeta[category][resourceName] !== undefined) {
                    delete amplifyMeta[category][resourceName];
                }
                jsonString = JSON.stringify(amplifyMeta, null, '\t');
                fs.writeFileSync(amplifyMetaFilePath, jsonString, 'utf8');
                // Remove resource directory from backend/
                context.filesystem.remove(resourceDir);
                removeResourceParameters(context, category, resourceName);
                updateBackendConfigAfterResourceRemove(category, resourceName);
                context.print.success('Successfully removed resource');
                return [2 /*return*/, resourceValues];
        }
    });
}); };
module.exports = {
    removeResource: removeResource,
    forceRemoveResource: forceRemoveResource,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/remove-resource.js.map