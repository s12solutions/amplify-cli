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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var plugin_collection_1 = __importDefault(require("../domain/plugin-collection"));
var plugin_platform_1 = __importDefault(require("../domain/plugin-platform"));
var constants_1 = __importDefault(require("../domain/constants"));
var global_prefix_1 = require("../utils/global-prefix");
var plugin_info_1 = __importDefault(require("../domain/plugin-info"));
var verify_plugin_1 = require("./verify-plugin");
var access_plugins_file_1 = require("./access-plugins-file");
var compare_plugins_1 = require("./compare-plugins");
var is_child_path_1 = __importDefault(require("../utils/is-child-path"));
function scanPluginPlatform(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, sequential, scanUserLocationTasks, scanDirTasks;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = pluginPlatform;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, access_plugins_file_1.readPluginsJsonFile()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    pluginPlatform = _a || new plugin_platform_1.default();
                    pluginPlatform.plugins = new plugin_collection_1.default();
                    return [4 /*yield*/, addCore(pluginPlatform)];
                case 3:
                    _b.sent();
                    sequential = require('promise-sequential');
                    if (!(pluginPlatform.userAddedLocations && pluginPlatform.userAddedLocations.length > 0)) return [3 /*break*/, 5];
                    // clean up the userAddedLocation first
                    pluginPlatform.userAddedLocations =
                        pluginPlatform.userAddedLocations.filter(function (pluginDirPath) {
                            var result = fs_extra_1.default.existsSync(pluginDirPath);
                            return result;
                        });
                    scanUserLocationTasks = pluginPlatform.userAddedLocations.map(function (pluginDirPath) { return function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, verifyAndAdd(pluginPlatform, pluginDirPath)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }; });
                    return [4 /*yield*/, sequential(scanUserLocationTasks)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    if (!(pluginPlatform.pluginDirectories.length > 0 && pluginPlatform.pluginPrefixes.length > 0)) return [3 /*break*/, 7];
                    scanDirTasks = pluginPlatform.pluginDirectories.map(function (directory) { return function () { return __awaiter(_this, void 0, void 0, function () {
                        var exists, subDirNames, scanSubDirTasks;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    directory = normalizePluginDirectory(directory);
                                    return [4 /*yield*/, fs_extra_1.default.pathExists(directory)];
                                case 1:
                                    exists = _a.sent();
                                    if (!exists) return [3 /*break*/, 4];
                                    return [4 /*yield*/, fs_extra_1.default.readdir(directory)];
                                case 2:
                                    subDirNames = _a.sent();
                                    if (!(subDirNames.length > 0)) return [3 /*break*/, 4];
                                    scanSubDirTasks = subDirNames.map(function (subDirName) {
                                        return function () { return __awaiter(_this, void 0, void 0, function () {
                                            var pluginDirPath;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!isMatchingNamePattern(pluginPlatform.pluginPrefixes, subDirName)) return [3 /*break*/, 2];
                                                        pluginDirPath = path_1.default.join(directory, subDirName);
                                                        return [4 /*yield*/, verifyAndAdd(pluginPlatform, pluginDirPath)];
                                                    case 1:
                                                        _a.sent();
                                                        _a.label = 2;
                                                    case 2: return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                    });
                                    return [4 /*yield*/, sequential(scanSubDirTasks)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }; });
                    return [4 /*yield*/, sequential(scanDirTasks)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    pluginPlatform.lastScanTime = new Date();
                    return [4 /*yield*/, access_plugins_file_1.writePluginsJsonFile(pluginPlatform)];
                case 8:
                    _b.sent();
                    return [2 /*return*/, pluginPlatform];
            }
        });
    });
}
exports.scanPluginPlatform = scanPluginPlatform;
function getCorePluginDirPath() {
    return path_1.default.normalize(path_1.default.join(__dirname, '../../'));
}
exports.getCorePluginDirPath = getCorePluginDirPath;
function addCore(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var corePluginDirPath, pluginVerificationResult, manifest, _a, name_1, version, pluginInfo;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    corePluginDirPath = getCorePluginDirPath();
                    return [4 /*yield*/, verify_plugin_1.verifyPlugin(corePluginDirPath)];
                case 1:
                    pluginVerificationResult = _b.sent();
                    if (pluginVerificationResult.verified) {
                        manifest = pluginVerificationResult.manifest;
                        _a = pluginVerificationResult.packageJson, name_1 = _a.name, version = _a.version;
                        pluginInfo = new plugin_info_1.default(name_1, version, corePluginDirPath, manifest);
                        pluginPlatform.plugins[manifest.name] = [];
                        pluginPlatform.plugins[manifest.name].push(pluginInfo);
                    }
                    else {
                        throw new Error('The local Amplify-CLI is corrupted');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function normalizePluginDirectory(directory) {
    var result = directory;
    if (directory === constants_1.default.LocalNodeModules) {
        result = path_1.default.normalize(path_1.default.join(__dirname, '../../node_modules'));
    }
    else if (directory === constants_1.default.ParentDirectory) {
        result = path_1.default.normalize(path_1.default.join(__dirname, '../../../'));
    }
    else if (directory === constants_1.default.GlobalNodeModules) {
        result = global_prefix_1.getGlobalNodeModuleDirPath();
    }
    return result;
}
exports.normalizePluginDirectory = normalizePluginDirectory;
function isMatchingNamePattern(pluginPrefixes, pluginDirName) {
    if (pluginPrefixes && pluginPrefixes.length > 0) {
        return pluginPrefixes.some(function (prefix) {
            var regex = new RegExp("^" + prefix);
            return regex.test(pluginDirName);
        });
    }
    return true;
}
function verifyAndAdd(pluginPlatform, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginVerificationResult, manifest, _a, name_2, version, pluginInfo_1, isPluginExcluded, pluginAlreadyAdded;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, verify_plugin_1.verifyPlugin(pluginDirPath)];
                case 1:
                    pluginVerificationResult = _b.sent();
                    if (pluginVerificationResult.verified &&
                        // Only the current core is added by the addCore(.) method, other packages can not be core
                        pluginVerificationResult.manifest.name !== constants_1.default.CORE) {
                        manifest = pluginVerificationResult.manifest;
                        _a = pluginVerificationResult.packageJson, name_2 = _a.name, version = _a.version;
                        pluginInfo_1 = new plugin_info_1.default(name_2, version, pluginDirPath, manifest);
                        isPluginExcluded = false;
                        if (pluginPlatform.excluded && pluginPlatform.excluded[manifest.name]) {
                            isPluginExcluded = pluginPlatform.excluded[manifest.name].some(function (item) { return compare_plugins_1.twoPluginsAreTheSame(item, pluginInfo_1); });
                        }
                        if (!isPluginExcluded) {
                            pluginPlatform.plugins[manifest.name] = pluginPlatform.plugins[manifest.name] || [];
                            pluginAlreadyAdded = pluginPlatform.plugins[manifest.name].some(function (item) { return compare_plugins_1.twoPluginsAreTheSame(item, pluginInfo_1); });
                            if (!pluginAlreadyAdded) {
                                pluginPlatform.plugins[manifest.name].push(pluginInfo_1);
                            }
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function isUnderScanCoverageSync(pluginPlatform, pluginDirPath) {
    var result = false;
    pluginDirPath = path_1.default.normalize(pluginDirPath);
    var pluginDirName = path_1.default.basename(pluginDirPath);
    if (fs_extra_1.default.existsSync(pluginDirPath) &&
        isMatchingNamePattern(pluginPlatform.pluginPrefixes, pluginDirName)) {
        result = pluginPlatform.pluginDirectories.some(function (directory) {
            directory = normalizePluginDirectory(directory);
            if (fs_extra_1.default.existsSync(directory) && is_child_path_1.default(pluginDirPath, directory)) {
                return true;
            }
        });
    }
    return result;
}
exports.isUnderScanCoverageSync = isUnderScanCoverageSync;
//# sourceMappingURL=../../src/lib/plugin-helpers/scan-plugin-platform.js.map