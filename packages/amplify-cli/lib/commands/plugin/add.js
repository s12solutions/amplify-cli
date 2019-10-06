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
var os_1 = __importDefault(require("os"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var constants_1 = __importDefault(require("../../domain/constants"));
var plugin_manager_1 = require("../../plugin-manager");
var inquirer_helper_1 = __importStar(require("../../domain/inquirer-helper"));
var add_plugin_result_1 = require("../../domain/add-plugin-result");
var scan_plugin_platform_1 = require("../../plugin-helpers/scan-plugin-platform");
var NEW_PLUGIN_PACKAGE = 'A new plugin package';
var CANCEL = 'cancel';
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var input, excluded, confirmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(context.input.subCommands && context.input.subCommands.length > 1)) return [3 /*break*/, 9];
                    input = context.input.subCommands[1];
                    excluded = context.pluginPlatform.excluded;
                    if (!(excluded[input] && excluded[input].length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'confirm',
                            name: 'confirmed',
                            message: "Add from previously removed " + input + " plugin",
                            default: true,
                        })];
                case 1:
                    confirmed = (_a.sent()).confirmed;
                    if (!confirmed) return [3 /*break*/, 3];
                    return [4 /*yield*/, addExcludedPluginPackage(context, excluded[input])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, resolvePluginPathAndAdd(context, input)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, resolvePluginPathAndAdd(context, input)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, promptAndAdd(context)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
function resolvePluginPathAndAdd(context, inputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginDirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolvePluginPackagePath(context, inputPath)];
                case 1:
                    pluginDirPath = _a.sent();
                    if (pluginDirPath) {
                        addNewPluginPackage(context, pluginDirPath);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function resolvePluginPackagePath(context, inputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var result, pluginPlatform, searchDirPaths, candicatePluginDirPaths, confirmed, options, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (path_1.default.isAbsolute(inputPath)) {
                        return [2 /*return*/, inputPath];
                    }
                    pluginPlatform = context.pluginPlatform;
                    searchDirPaths = [
                        constants_1.default.ParentDirectory,
                        constants_1.default.LocalNodeModules,
                        constants_1.default.GlobalNodeModules,
                        process.cwd(),
                    ];
                    searchDirPaths = searchDirPaths.filter(function (dirPath) {
                        return !pluginPlatform.pluginDirectories.includes(dirPath.toString());
                    });
                    searchDirPaths = searchDirPaths.concat(pluginPlatform.pluginDirectories);
                    candicatePluginDirPaths = searchDirPaths.map(function (dirPath) {
                        return path_1.default.normalize(path_1.default.join(scan_plugin_platform_1.normalizePluginDirectory(dirPath), inputPath));
                    }).filter(function (pluginDirPath) {
                        return fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory();
                    });
                    if (!(candicatePluginDirPaths.length === 0)) return [3 /*break*/, 2];
                    context.print.error('Can not locate the plugin package.');
                    return [4 /*yield*/, promptForPluginPath()];
                case 1:
                    result = _a.sent();
                    return [3 /*break*/, 6];
                case 2:
                    if (!(candicatePluginDirPaths.length === 1)) return [3 /*break*/, 4];
                    context.print.green('Plugin package found.');
                    context.print.blue(candicatePluginDirPaths[0]);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'confirm',
                            name: 'confirmed',
                            message: "Confirm to add the plugin package to your Amplify CLI.",
                            default: true,
                        })];
                case 3:
                    confirmed = (_a.sent()).confirmed;
                    if (confirmed) {
                        result = candicatePluginDirPaths[0];
                    }
                    return [3 /*break*/, 6];
                case 4:
                    if (!(candicatePluginDirPaths.length > 1)) return [3 /*break*/, 6];
                    context.print.warning('Multiple plugins with the package name are found.');
                    options = candicatePluginDirPaths.concat([
                        CANCEL,
                    ]);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the plugin package to add',
                            choices: options,
                        })];
                case 5:
                    answer = _a.sent();
                    if (answer.selection !== CANCEL) {
                        result = answer.selection;
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
function promptAndAdd(context) {
    return __awaiter(this, void 0, void 0, function () {
        var options, excluded, answer, pluginDirPath, pluginDirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = new Array();
                    excluded = context.pluginPlatform.excluded;
                    if (excluded && Object.keys(excluded).length > 0) {
                        Object.keys(excluded).forEach(function (key) {
                            if (excluded[key].length > 0) {
                                var option = {
                                    name: key + inquirer_helper_1.EXPAND,
                                    value: excluded[key],
                                    short: key + inquirer_helper_1.EXPAND,
                                };
                                if (excluded[key].length === 1) {
                                    var pluginInfo = excluded[key][0];
                                    option.name = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                                    option.short = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                                }
                                options.push(option);
                            }
                        });
                    }
                    if (!(options.length > 0)) return [3 /*break*/, 7];
                    options.unshift({
                        name: NEW_PLUGIN_PACKAGE,
                        value: NEW_PLUGIN_PACKAGE,
                        short: NEW_PLUGIN_PACKAGE,
                    });
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the plugin package to add',
                            choices: options,
                        })];
                case 1:
                    answer = _a.sent();
                    if (!(answer.selection === NEW_PLUGIN_PACKAGE)) return [3 /*break*/, 4];
                    return [4 /*yield*/, promptForPluginPath()];
                case 2:
                    pluginDirPath = _a.sent();
                    return [4 /*yield*/, addNewPluginPackage(context, pluginDirPath)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, addExcludedPluginPackage(context, answer.selection)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, promptForPluginPath()];
                case 8:
                    pluginDirPath = _a.sent();
                    return [4 /*yield*/, addNewPluginPackage(context, pluginDirPath)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function promptForPluginPath() {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_helper_1.default.prompt({
                        type: 'input',
                        name: 'pluginDirPath',
                        message: "Enter the absolute path for the root of the plugin directory: " + os_1.default.EOL,
                        transformer: function (pluginDirPath) { return pluginDirPath.trim(); },
                        validate: function (pluginDirPath) {
                            pluginDirPath = pluginDirPath.trim();
                            if (fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory()) {
                                return true;
                            }
                            return 'The plugin package directory path you entered does NOT exist';
                        },
                    })];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/, answer.pluginDirPath];
            }
        });
    });
}
function addNewPluginPackage(context, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var addUserPluginResult, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    addUserPluginResult = plugin_manager_1.addUserPluginPackage(context.pluginPlatform, pluginDirPath.trim());
                    if (!addUserPluginResult.isAdded) return [3 /*break*/, 2];
                    context.print.success('Successfully added plugin package.');
                    return [4 /*yield*/, plugin_manager_1.confirmAndScan(context.pluginPlatform)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    context.print.error('Failed to add the plugin package.');
                    context.print.info("Error code: " + addUserPluginResult.error);
                    if (addUserPluginResult.error === add_plugin_result_1.AddPluginError.FailedVerification &&
                        addUserPluginResult.pluginVerificationResult &&
                        addUserPluginResult.pluginVerificationResult.error) {
                        context.print.info("Plugin verification error code: " + addUserPluginResult.pluginVerificationResult.error);
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    context.print.error('Failed to add the plugin package.');
                    context.print.info(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function addExcludedPluginPackage(context, userSelection) {
    return __awaiter(this, void 0, void 0, function () {
        var options_1, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(userSelection.length > 0)) return [3 /*break*/, 5];
                    if (!(userSelection.length === 1)) return [3 /*break*/, 1];
                    plugin_manager_1.addExcludedPluginPackage(context.pluginPlatform, userSelection[0]);
                    return [3 /*break*/, 3];
                case 1:
                    options_1 = new Array();
                    userSelection.forEach(function (pluginInfo) {
                        options_1.push({
                            name: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                            value: pluginInfo,
                            short: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                        });
                    });
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the plugin package to add',
                            choices: options_1,
                        })];
                case 2:
                    answer = _a.sent();
                    plugin_manager_1.addExcludedPluginPackage(context.pluginPlatform, answer.selection);
                    _a.label = 3;
                case 3: return [4 /*yield*/, plugin_manager_1.confirmAndScan(context.pluginPlatform)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=../../../src/lib/commands/plugin/add.js.map