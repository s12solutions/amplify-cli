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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_info_1 = __importDefault(require("./domain/plugin-info"));
var access_plugins_file_1 = require("./plugin-helpers/access-plugins-file");
var scan_plugin_platform_1 = require("./plugin-helpers/scan-plugin-platform");
var verify_plugin_1 = require("./plugin-helpers/verify-plugin");
exports.verifyPlugin = verify_plugin_1.verifyPlugin;
var create_new_plugin_1 = __importDefault(require("./plugin-helpers/create-new-plugin"));
exports.createNewPlugin = create_new_plugin_1.default;
var add_plugin_result_1 = __importStar(require("./domain/add-plugin-result"));
var compare_plugins_1 = require("./plugin-helpers/compare-plugins");
var inquirer_helper_1 = __importDefault(require("./domain/inquirer-helper"));
var constants_1 = __importDefault(require("./domain/constants"));
var context_extensions_1 = require("./context-extensions");
function getPluginPlatform() {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPlatform, lastScanTime, currentTime, timeDiffInSeconds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginPlatform = access_plugins_file_1.readPluginsJsonFileSync();
                    if (!pluginPlatform) return [3 /*break*/, 6];
                    if (!isCoreMatching(pluginPlatform)) return [3 /*break*/, 3];
                    lastScanTime = new Date(pluginPlatform.lastScanTime);
                    currentTime = new Date();
                    timeDiffInSeconds = (currentTime.getTime() - lastScanTime.getTime()) / 1000;
                    if (!(timeDiffInSeconds > pluginPlatform.maxScanIntervalInSeconds)) return [3 /*break*/, 2];
                    return [4 /*yield*/, scan()];
                case 1:
                    pluginPlatform = _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, scan()];
                case 4:
                    pluginPlatform = _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, scan()];
                case 7:
                    pluginPlatform = _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, pluginPlatform];
            }
        });
    });
}
exports.getPluginPlatform = getPluginPlatform;
function isCoreMatching(pluginPlatform) {
    try {
        var currentCorePluginDirPath = scan_plugin_platform_1.getCorePluginDirPath();
        var platformCorePluginDirPath = pluginPlatform.plugins[constants_1.default.CORE][0].packageLocation;
        return currentCorePluginDirPath === platformCorePluginDirPath;
    }
    catch (_a) {
        return false;
    }
}
function getPluginsWithName(pluginPlatform, nameOrAlias) {
    var result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(function (pluginName) {
        if (pluginName === nameOrAlias) {
            result = result.concat(pluginPlatform.plugins[pluginName]);
        }
        else {
            pluginPlatform.plugins[pluginName].forEach(function (pluginInfo) {
                if (pluginInfo.manifest.aliases &&
                    pluginInfo.manifest.aliases.includes(nameOrAlias)) {
                    result.push(pluginInfo);
                }
            });
        }
    });
    return result;
}
exports.getPluginsWithName = getPluginsWithName;
function getPluginsWithNameAndCommand(pluginPlatform, nameOrAlias, command) {
    var result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(function (pluginName) {
        pluginPlatform.plugins[pluginName].forEach(function (pluginInfo) {
            var _a = pluginInfo.manifest, name = _a.name, aliases = _a.aliases, commands = _a.commands, commandAliases = _a.commandAliases;
            var nameOrAliasMatching = (name === nameOrAlias) ||
                (aliases && aliases.includes(nameOrAlias));
            if (nameOrAliasMatching) {
                if ((commands && commands.includes(command)) ||
                    (commandAliases && Object.keys(commandAliases).includes(command))) {
                    result.push(pluginInfo);
                }
            }
        });
    });
    return result;
}
exports.getPluginsWithNameAndCommand = getPluginsWithNameAndCommand;
function getPluginsWithEventHandler(pluginPlatform, event) {
    var result = new Array();
    Object.keys(pluginPlatform.plugins).forEach(function (pluginName) {
        pluginPlatform.plugins[pluginName].forEach(function (pluginInfo) {
            var eventHandlers = pluginInfo.manifest.eventHandlers;
            if (eventHandlers && eventHandlers.length > 0 && eventHandlers.includes(event)) {
                result.push(pluginInfo);
            }
        });
    });
    return result;
}
exports.getPluginsWithEventHandler = getPluginsWithEventHandler;
function getAllPluginNames(pluginPlatform) {
    var result = new Set();
    Object.keys(pluginPlatform.plugins).forEach(function (pluginName) {
        result.add(pluginName);
        pluginPlatform.plugins[pluginName].forEach(function (pluginInfo) {
            if (pluginInfo.manifest.aliases &&
                pluginInfo.manifest.aliases.length > 0) {
                pluginInfo.manifest.aliases.forEach(function (alias) {
                    result.add(alias);
                });
            }
        });
    });
    return result;
}
exports.getAllPluginNames = getAllPluginNames;
function scan(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context_extensions_1.print.info('Scanning for plugins...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, scan_plugin_platform_1.scanPluginPlatform(pluginPlatform)];
                case 2:
                    result = _a.sent();
                    context_extensions_1.print.info('Plugin scan successful');
                    return [2 /*return*/, result];
                case 3:
                    e_1 = _a.sent();
                    context_extensions_1.print.error('Plugin scan failed.');
                    throw new Error('Plugin scan failed.');
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.scan = scan;
function confirmAndScan(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var confirmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_helper_1.default.prompt({
                        type: 'confirm',
                        name: 'confirmed',
                        message: 'Run a fresh scan for plugins on the Amplify CLI pluggable platform',
                        default: false,
                    })];
                case 1:
                    confirmed = (_a.sent()).confirmed;
                    if (!confirmed) return [3 /*break*/, 3];
                    return [4 /*yield*/, scan(pluginPlatform)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.confirmAndScan = confirmAndScan;
function addUserPluginPackage(pluginPlatform, pluginDirPath) {
    return addPluginPackage(pluginPlatform, pluginDirPath);
}
exports.addUserPluginPackage = addUserPluginPackage;
function addExcludedPluginPackage(pluginPlatform, pluginInfo) {
    return addPluginPackage(pluginPlatform, pluginInfo.packageLocation);
}
exports.addExcludedPluginPackage = addExcludedPluginPackage;
function addPluginPackage(pluginPlatform, pluginDirPath) {
    var pluginVerificationResult = verify_plugin_1.verifyPluginSync(pluginDirPath);
    var result = new add_plugin_result_1.default(false, pluginVerificationResult);
    if (pluginVerificationResult.verified) {
        var packageJson = pluginVerificationResult.packageJson, manifest = pluginVerificationResult.manifest;
        var pluginInfo_1 = new plugin_info_1.default(packageJson.name, packageJson.version, pluginDirPath, manifest);
        // take the package out of the excluded
        if (pluginPlatform.excluded[pluginInfo_1.manifest.name] &&
            pluginPlatform.excluded[pluginInfo_1.manifest.name].length > 0) {
            var updatedExcluded_1 = new Array();
            pluginPlatform.excluded[pluginInfo_1.manifest.name].forEach(function (pluginInfoItem) {
                if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo_1)) {
                    updatedExcluded_1.push(pluginInfoItem);
                }
            });
            if (updatedExcluded_1.length > 0) {
                pluginPlatform.excluded[pluginInfo_1.manifest.name] = updatedExcluded_1;
            }
            else {
                delete pluginPlatform.excluded[pluginInfo_1.manifest.name];
            }
        }
        // insert into the plugins
        var updatedPlugins_1 = new Array();
        if (pluginPlatform.plugins[pluginInfo_1.manifest.name] &&
            pluginPlatform.plugins[pluginInfo_1.manifest.name].length > 0) {
            pluginPlatform.plugins[pluginInfo_1.manifest.name].forEach(function (pluginInfoItem) {
                if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo_1)) {
                    updatedPlugins_1.push(pluginInfoItem);
                }
            });
        }
        updatedPlugins_1.push(pluginInfo_1);
        pluginPlatform.plugins[pluginInfo_1.manifest.name] = updatedPlugins_1;
        // insert into the userAddedLocations if it's not under scan coverage
        if (!scan_plugin_platform_1.isUnderScanCoverageSync(pluginPlatform, pluginDirPath) &&
            !pluginPlatform.userAddedLocations.includes(pluginDirPath)) {
            pluginPlatform.userAddedLocations.push(pluginDirPath);
        }
        // write the plugins.json file
        access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
        result.isAdded = true;
    }
    else {
        result.error = add_plugin_result_1.AddPluginError.FailedVerification;
    }
    return result;
}
exports.addPluginPackage = addPluginPackage;
// remove: select from the plugins only,
// if the location belongs to the scan directories, put the info inside the excluded.
// if the location is in the useraddedlocaitons, remove it from the user added locations.
function removePluginPackage(pluginPlatform, pluginInfo) {
    // remove from the plugins
    if (pluginPlatform.plugins[pluginInfo.manifest.name] &&
        pluginPlatform.plugins[pluginInfo.manifest.name].length > 0) {
        var updatedPlugins_2 = new Array();
        pluginPlatform.plugins[pluginInfo.manifest.name].forEach(function (pluginInfoItem) {
            if (!compare_plugins_1.twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                updatedPlugins_2.push(pluginInfoItem);
            }
        });
        if (updatedPlugins_2.length > 0) {
            pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins_2;
        }
        else {
            delete pluginPlatform.plugins[pluginInfo.manifest.name];
        }
    }
    // remove from the userAddedLocations
    if (pluginPlatform.userAddedLocations.includes(pluginInfo.packageLocation)) {
        var updatedUserAddedLocations_1 = new Array();
        pluginPlatform.userAddedLocations.forEach(function (packageLocation) {
            if (packageLocation !== pluginInfo.packageLocation) {
                updatedUserAddedLocations_1.push(packageLocation);
            }
        });
        pluginPlatform.userAddedLocations = updatedUserAddedLocations_1;
    }
    // if the plugin is under scan coverage, insert into the excluded
    if (scan_plugin_platform_1.isUnderScanCoverageSync(pluginPlatform, pluginInfo.packageLocation)) {
        pluginPlatform.excluded[pluginInfo.manifest.name] =
            pluginPlatform.excluded[pluginInfo.manifest.name] || [];
        pluginPlatform.excluded[pluginInfo.manifest.name].push(pluginInfo);
    }
    access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
}
exports.removePluginPackage = removePluginPackage;
//# sourceMappingURL=../src/lib/plugin-manager.js.map