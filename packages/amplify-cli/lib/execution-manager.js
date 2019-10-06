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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var constants_1 = __importDefault(require("./domain/constants"));
var plugin_manager_1 = require("./plugin-manager");
var inquirer_helper_1 = __importDefault(require("./domain/inquirer-helper"));
var constants_2 = __importDefault(require("./domain/constants"));
var amplify_event_1 = require("./domain/amplify-event");
function executeCommand(context) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginCandidates, answer, pluginModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginCandidates = plugin_manager_1.getPluginsWithNameAndCommand(context.pluginPlatform, context.input.plugin, context.input.command);
                    if (!(pluginCandidates.length === 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, executePluginModuleCommand(context, pluginCandidates[0])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!(pluginCandidates.length > 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'section',
                            message: 'Select the module to execute',
                            choices: pluginCandidates.map(function (plugin) {
                                var pluginOptions = {
                                    name: plugin.packageName + '@' + plugin.packageVersion,
                                    value: plugin,
                                    short: plugin.packageName + '@' + plugin.packageVersion,
                                };
                                return pluginOptions;
                            }),
                        })];
                case 3:
                    answer = _a.sent();
                    pluginModule = answer.section;
                    return [4 /*yield*/, executePluginModuleCommand(context, pluginModule)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.executeCommand = executeCommand;
function executePluginModuleCommand(context, plugin) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, commands, commandAliases, pluginModule, commandFilepath, commandModule, showAllHelp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = plugin.manifest, commands = _a.commands, commandAliases = _a.commandAliases;
                    if (!commands.includes(context.input.command)) {
                        context.input.command = commandAliases[context.input.command];
                    }
                    if (!fs_extra_1.default.existsSync(plugin.packageLocation)) return [3 /*break*/, 8];
                    return [4 /*yield*/, raisePreEvent(context)];
                case 1:
                    _b.sent();
                    pluginModule = require(plugin.packageLocation);
                    if (!(pluginModule.hasOwnProperty(constants_2.default.ExecuteAmplifyCommand) &&
                        typeof pluginModule[constants_2.default.ExecuteAmplifyCommand] === 'function')) return [3 /*break*/, 3];
                    attachContextExtensions(context, plugin);
                    return [4 /*yield*/, pluginModule.executeAmplifyCommand(context)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 3:
                    commandFilepath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'commands', plugin.manifest.name, context.input.command));
                    if (context.input.subCommands && context.input.subCommands.length > 0) {
                        commandFilepath = path_1.default.join.apply(path_1.default, __spreadArrays([commandFilepath], context.input.subCommands));
                    }
                    commandModule = void 0;
                    try {
                        commandModule = require(commandFilepath);
                    }
                    catch (e) {
                        // do nothing
                    }
                    if (!commandModule) {
                        commandFilepath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'commands', plugin.manifest.name));
                        try {
                            commandModule = require(commandFilepath);
                        }
                        catch (e) {
                            // do nothing
                        }
                    }
                    if (!commandModule) return [3 /*break*/, 5];
                    attachContextExtensions(context, plugin);
                    return [4 /*yield*/, commandModule.run(context)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    showAllHelp = require('./extensions/amplify-helpers/show-all-help').showAllHelp;
                    showAllHelp(context);
                    _b.label = 6;
                case 6: return [4 /*yield*/, raisePostEvent(context)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, plugin_manager_1.scan()];
                case 9:
                    _b.sent();
                    context.print.error('The Amplify CLI plugin platform detected an error.');
                    context.print.info('It has performed a fresh scan.');
                    context.print.info('Please execute your command again.');
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function raisePreEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(context.input.plugin === constants_1.default.CORE)) return [3 /*break*/, 4];
                    if (!(context.input.command === 'init')) return [3 /*break*/, 2];
                    return [4 /*yield*/, raisePreInitEvent(context)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(context.input.command === 'push')) return [3 /*break*/, 4];
                    return [4 /*yield*/, raisePrePushEvent(context)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function raisePreInitEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PreInit, new amplify_event_1.AmplifyPreInitEventData()))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function raisePrePushEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PrePush, new amplify_event_1.AmplifyPrePushEventData()))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function raisePostEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(context.input.plugin === constants_1.default.CORE)) return [3 /*break*/, 4];
                    if (!(context.input.command === 'init')) return [3 /*break*/, 2];
                    return [4 /*yield*/, raisePostInitEvent(context)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(context.input.command === 'push')) return [3 /*break*/, 4];
                    return [4 /*yield*/, raisePostPushEvent(context)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function raisePostInitEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PostInit, new amplify_event_1.AmplifyPostPushEventData()))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function raisePostPushEvent(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, raiseEvent(context, new amplify_event_1.AmplifyEventArgs(amplify_event_1.AmplifyEvent.PostPush, new amplify_event_1.AmplifyPostInitEventData()))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function raiseEvent(context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var plugins, sequential, eventHandlers;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    plugins = plugin_manager_1.getPluginsWithEventHandler(context.pluginPlatform, args.event);
                    if (!(plugins.length > 0)) return [3 /*break*/, 2];
                    sequential = require('promise-sequential');
                    eventHandlers = plugins.filter(function (plugin) {
                        var exists = fs_extra_1.default.existsSync(plugin.packageLocation);
                        return exists;
                    }).map(function (plugin) {
                        var eventHandler = function () { return __awaiter(_this, void 0, void 0, function () {
                            var pluginModule, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        attachContextExtensions(context, plugin);
                                        pluginModule = require(plugin.packageLocation);
                                        return [4 /*yield*/, pluginModule.handleAmplifyEvent(context, args)];
                                    case 1:
                                        _b.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _a = _b.sent();
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return eventHandler;
                    });
                    return [4 /*yield*/, sequential(eventHandlers)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.raiseEvent = raiseEvent;
// for backward compatabilities, extensions to the context object
function attachContextExtensions(context, plugin) {
    var extensionsDirPath = path_1.default.normalize(path_1.default.join(plugin.packageLocation, 'extensions'));
    if (fs_extra_1.default.existsSync(extensionsDirPath)) {
        var stats = fs_extra_1.default.statSync(extensionsDirPath);
        if (stats.isDirectory()) {
            var itemNames = fs_extra_1.default.readdirSync(extensionsDirPath);
            itemNames.forEach(function (itemName) {
                var itemPath = path_1.default.join(extensionsDirPath, itemName);
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
//# sourceMappingURL=../src/lib/execution-manager.js.map