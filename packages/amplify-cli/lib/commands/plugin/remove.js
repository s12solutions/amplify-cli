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
var plugin_manager_1 = require("../../plugin-manager");
var constants_1 = __importDefault(require("../../domain/constants"));
var inquirer_helper_1 = __importStar(require("../../domain/inquirer-helper"));
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var options, plugins, selections, sequential, removeTasks;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = new Array();
                    plugins = context.pluginPlatform.plugins;
                    if (plugins && Object.keys(plugins).length > 0) {
                        Object.keys(plugins).forEach(function (key) {
                            if (key === constants_1.default.CORE) {
                                return;
                            }
                            if (plugins[key].length > 0) {
                                var option = {
                                    name: key + inquirer_helper_1.EXPAND,
                                    value: plugins[key],
                                    short: key + inquirer_helper_1.EXPAND,
                                };
                                if (plugins[key].length === 1) {
                                    var pluginInfo = plugins[key][0];
                                    option.name = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                                    option.short = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                                }
                                options.push(option);
                            }
                        });
                    }
                    if (!(options.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'checkbox',
                            name: 'selections',
                            message: 'Select the plugin packages to remove',
                            choices: options,
                        })];
                case 1:
                    selections = (_a.sent()).selections;
                    if (!(selections.length > 0)) return [3 /*break*/, 4];
                    sequential = require('promise-sequential');
                    removeTasks = selections.map(function (selection) { return function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, removeNamedPlugins(context.pluginPlatform, selection)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }; });
                    return [4 /*yield*/, sequential(removeTasks)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, plugin_manager_1.confirmAndScan(context.pluginPlatform)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    context.print.console.error('No plugins are found');
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
function removeNamedPlugins(pluginPlatform, pluginInfos) {
    return __awaiter(this, void 0, void 0, function () {
        var options, selections, sequential, removeTasks;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(pluginInfos.length === 1)) return [3 /*break*/, 1];
                    plugin_manager_1.removePluginPackage(pluginPlatform, pluginInfos[0]);
                    return [3 /*break*/, 4];
                case 1:
                    if (!(pluginInfos.length > 1)) return [3 /*break*/, 4];
                    options = pluginInfos.map(function (pluginInfo) {
                        var optionObject = {
                            name: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                            value: pluginInfo,
                            short: pluginInfo.packageName + '@' + pluginInfo.packageVersion,
                        };
                        return optionObject;
                    });
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'checkbox',
                            name: 'selections',
                            message: 'Select the plugin packages to remove',
                            choices: options,
                        })];
                case 2:
                    selections = (_a.sent()).selections;
                    if (!(selections.length > 0)) return [3 /*break*/, 4];
                    sequential = require('promise-sequential');
                    removeTasks = selections.map(function (pluginInfo) { return function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, plugin_manager_1.removePluginPackage(pluginPlatform, pluginInfo)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }; });
                    return [4 /*yield*/, sequential(removeTasks)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=../../../src/lib/commands/plugin/remove.js.map