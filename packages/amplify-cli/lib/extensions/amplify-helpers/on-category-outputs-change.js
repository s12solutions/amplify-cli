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
var pathManager = require('./path-manager');
var getResourceOutputs = require('./get-resource-outputs').getResourceOutputs;
var readJsonFile = require('./read-json-file').readJsonFile;
var sequential = require('promise-sequential');
function onCategoryOutputsChange(context, cloudAmplifyMeta, localMeta) {
    return __awaiter(this, void 0, void 0, function () {
        var currentAmplifyMetafilePath, projectConfigFilePath, projectConfig, frontendPlugins, frontendHandlerModule, outputChangedEventTasks, categoryPlugins;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cloudAmplifyMeta) {
                        currentAmplifyMetafilePath = context.amplify.pathManager.getCurentAmplifyMetaFilePath();
                        if (fs.existsSync(currentAmplifyMetafilePath)) {
                            cloudAmplifyMeta = readJsonFile(currentAmplifyMetafilePath);
                        }
                        else {
                            cloudAmplifyMeta = {};
                        }
                    }
                    projectConfigFilePath = pathManager.getProjectConfigFilePath();
                    projectConfig = readJsonFile(projectConfigFilePath);
                    if (!projectConfig.frontend) return [3 /*break*/, 2];
                    frontendPlugins = context.amplify.getFrontendPlugins(context);
                    frontendHandlerModule = require(frontendPlugins[projectConfig.frontend]);
                    return [4 /*yield*/, frontendHandlerModule.createFrontendConfigs(context, getResourceOutputs(localMeta), getResourceOutputs(cloudAmplifyMeta))];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    outputChangedEventTasks = [];
                    categoryPlugins = context.amplify.getCategoryPlugins(context);
                    Object.keys(categoryPlugins).forEach(function (pluginName) {
                        var packageLocation = categoryPlugins[pluginName];
                        var pluginModule = require(packageLocation);
                        if (pluginModule && typeof pluginModule.onAmplifyCategoryOutputChange === 'function') {
                            outputChangedEventTasks.push(function () { return __awaiter(_this, void 0, void 0, function () {
                                var e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            attachContextExtensions(context, packageLocation);
                                            return [4 /*yield*/, pluginModule.onAmplifyCategoryOutputChange(context, cloudAmplifyMeta)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            e_1 = _a.sent();
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                    });
                    if (!(outputChangedEventTasks.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, sequential(outputChangedEventTasks)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function attachContextExtensions(context, packageLocation) {
    var extensionsDirPath = path.normalize(path.join(packageLocation, 'extensions'));
    if (fs.existsSync(extensionsDirPath)) {
        var stats = fs.statSync(extensionsDirPath);
        if (stats.isDirectory()) {
            var itemNames = fs.readdirSync(extensionsDirPath);
            itemNames.forEach(function (itemName) {
                var itemPath = path.join(extensionsDirPath, itemName);
                var itemModule;
                try {
                    itemModule = require(itemPath);
                    itemModule(context);
                }
                catch (e) {
                    // do nothing
                }
            });
        }
    }
}
module.exports = {
    onCategoryOutputsChange: onCategoryOutputsChange,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/on-category-outputs-change.js.map