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
var fs_extra_1 = __importDefault(require("fs-extra"));
var os_1 = __importDefault(require("os"));
var inquirer_helper_1 = __importDefault(require("../../domain/inquirer-helper"));
var constants_1 = __importDefault(require("../../domain/constants"));
var access_plugins_file_1 = require("../../plugin-helpers/access-plugins-file");
var scan_plugin_platform_1 = require("../../plugin-helpers/scan-plugin-platform");
var plugin_manager_1 = require("../../plugin-manager");
var display_plugin_platform_1 = require("../../plugin-helpers/display-plugin-platform");
var MINPREFIXLENGTH = 2;
var MAXPREFIXLENGTH = 20;
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPlatform, pluginDirectories, pluginPrefixes, maxScanIntervalInSeconds, exit, options, answer, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pluginPlatform = context.pluginPlatform;
                    pluginDirectories = 'scannable plugin directories';
                    pluginPrefixes = 'scannable plugin prefixes';
                    maxScanIntervalInSeconds = 'max CLI scan interval in seconds';
                    exit = 'save & exit';
                    options = [
                        pluginDirectories,
                        pluginPrefixes,
                        maxScanIntervalInSeconds,
                        exit,
                    ];
                    _b.label = 1;
                case 1: return [4 /*yield*/, inquirer_helper_1.default.prompt({
                        type: 'list',
                        name: 'selection',
                        message: 'Select the following options to configure',
                        choices: options,
                    })];
                case 2:
                    answer = _b.sent();
                    _a = answer.selection;
                    switch (_a) {
                        case pluginDirectories: return [3 /*break*/, 3];
                        case pluginPrefixes: return [3 /*break*/, 5];
                        case maxScanIntervalInSeconds: return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, configurePluginDirectories(context, pluginPlatform)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, configurePrefixes(context, pluginPlatform)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, configureScanInterval(context, pluginPlatform)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    configurePluginDirectories(context, pluginPlatform);
                    return [3 /*break*/, 10];
                case 10:
                    if (answer.selection !== exit) return [3 /*break*/, 1];
                    _b.label = 11;
                case 11:
                    access_plugins_file_1.writePluginsJsonFileSync(pluginPlatform);
                    return [2 /*return*/, plugin_manager_1.scan(pluginPlatform)];
            }
        });
    });
}
exports.run = run;
function configurePluginDirectories(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var ADD, REMOVE, EXIT, LEARNMORE, actionAnswer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
                    ADD = 'add';
                    REMOVE = 'remove';
                    EXIT = 'exit';
                    LEARNMORE = 'Learn more';
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'action',
                            message: 'Select the action on the directory list',
                            choices: [ADD, REMOVE, EXIT, LEARNMORE],
                        })];
                case 1:
                    actionAnswer = _a.sent();
                    if (!(actionAnswer.action === ADD)) return [3 /*break*/, 3];
                    return [4 /*yield*/, addPluginDirectory(pluginPlatform)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!(actionAnswer.action === REMOVE)) return [3 /*break*/, 5];
                    return [4 /*yield*/, removePluginDirectory(pluginPlatform)];
                case 4:
                    _a.sent();
                    if (pluginPlatform.pluginDirectories.length === 0) {
                        context.print.warning('You have removed all plugin directories.');
                        context.print.info('Plugin scan is now ineffecitive. \
Only explicitly added plugins are active.');
                        context.print.info('The Amplify CLI might not be fully functional.');
                    }
                    return [3 /*break*/, 7];
                case 5:
                    if (!(actionAnswer.action === LEARNMORE)) return [3 /*break*/, 7];
                    displayPluginDirectoriesLearnMore(context);
                    return [4 /*yield*/, configurePluginDirectories(context, pluginPlatform)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
                    return [2 /*return*/];
            }
        });
    });
}
function displayPluginDirectoriesLearnMore(context) {
    context.print.info('');
    context.print.green('The directories contained this list are searched for \
plugins in a plugin scan.');
    context.print.green('You can add or remove from this list to change the \
scan behavior, and consequently its outcome.');
    context.print.green('There are three well-known directories that the CLI \
usually scans for plugins.');
    context.print.red(constants_1.default.ParentDirectory);
    context.print.green(constants_1.default.ParentDirectory + " is the directory that contains the Amplify CLI Core package.");
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.default.ParentDirectory));
    context.print.red(constants_1.default.LocalNodeModules);
    context.print.green(constants_1.default.LocalNodeModules + " is the Amplify CLI Core package's local node_modules directory. ");
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.default.LocalNodeModules));
    context.print.red(constants_1.default.GlobalNodeModules);
    context.print.green(constants_1.default.GlobalNodeModules + " is the global node_modules directory.");
    context.print.blue(scan_plugin_platform_1.normalizePluginDirectory(constants_1.default.GlobalNodeModules));
    context.print.info('');
}
function addPluginDirectory(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var ADDCUSTOMDIRECTORY, options, addCustomDirectory, selectionAnswer, addNewAnswer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ADDCUSTOMDIRECTORY = 'Add custom directory >';
                    options = [
                        constants_1.default.ParentDirectory,
                        constants_1.default.LocalNodeModules,
                        constants_1.default.GlobalNodeModules,
                    ];
                    options = options.filter(function (item) { return !pluginPlatform.pluginDirectories.includes(item.toString()); });
                    addCustomDirectory = false;
                    if (!(options.length > 0)) return [3 /*break*/, 2];
                    options.push(ADDCUSTOMDIRECTORY);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the directory to add',
                            choices: options,
                        })];
                case 1:
                    selectionAnswer = _a.sent();
                    if (selectionAnswer.selection === ADDCUSTOMDIRECTORY) {
                        addCustomDirectory = true;
                    }
                    else {
                        pluginPlatform.pluginDirectories.push(selectionAnswer.selection);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    addCustomDirectory = true;
                    _a.label = 3;
                case 3:
                    if (!addCustomDirectory) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'input',
                            name: 'newScanDirectory',
                            message: "Enter the full path of the plugin scan directory you want to add" + os_1.default.EOL,
                            validate: function (input) {
                                if (!fs_extra_1.default.existsSync(input) || !fs_extra_1.default.statSync(input).isDirectory()) {
                                    return 'Must enter a valid full path of a directory';
                                }
                                return true;
                            },
                        })];
                case 4:
                    addNewAnswer = _a.sent();
                    pluginPlatform.pluginDirectories.push(addNewAnswer.newScanDirectory.trim());
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function removePluginDirectory(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_helper_1.default.prompt({
                        type: 'checkbox',
                        name: 'directoriesToRemove',
                        message: 'Select the directories that Amplify CLI should NOT scan for plugins',
                        choices: pluginPlatform.pluginDirectories,
                    })];
                case 1:
                    answer = _a.sent();
                    pluginPlatform.pluginDirectories = pluginPlatform.pluginDirectories.filter(function (dir) { return !answer.directoriesToRemove.includes(dir); });
                    return [2 /*return*/];
            }
        });
    });
}
function configurePrefixes(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var ADD, REMOVE, EXIT, LEARNMORE, actionAnswer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
                    ADD = 'add';
                    REMOVE = 'remove';
                    EXIT = 'exit';
                    LEARNMORE = 'Learn more';
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'action',
                            message: 'Select the action on the prefix list',
                            choices: [ADD, REMOVE, LEARNMORE, EXIT],
                        })];
                case 1:
                    actionAnswer = _a.sent();
                    if (!(actionAnswer.action === ADD)) return [3 /*break*/, 3];
                    return [4 /*yield*/, addPrefix(pluginPlatform)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!(actionAnswer.action === REMOVE)) return [3 /*break*/, 5];
                    return [4 /*yield*/, removePrefixes(pluginPlatform)];
                case 4:
                    _a.sent();
                    if (pluginPlatform.pluginPrefixes.length === 0) {
                        context.print.warning('You have removed all prefixes for plugin dir name matching!');
                        context.print.info('All the packages inside the plugin directories will be checked \
during a plugin scan, this can significantly increase the scan time.');
                    }
                    return [3 /*break*/, 7];
                case 5:
                    if (!(actionAnswer.action === LEARNMORE)) return [3 /*break*/, 7];
                    displayPluginPrefixesLearnMore(context);
                    return [4 /*yield*/, configurePluginDirectories(context, pluginPlatform)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
                    return [2 /*return*/];
            }
        });
    });
}
function displayPluginPrefixesLearnMore(context) {
    context.print.info('');
    context.print.green('The package name prefixes contained this list are used for \
plugin name matching in plugin scans.');
    context.print.green('Only packages with matching name are considered plugin candidates, \
they are verified and then added to the Amplify CLI.');
    context.print.green('If this list is empty, all packages inside the scanned directories \
are checked in plugin scans.');
    context.print.green('You can add or remove from this list to change the plugin \
scan behavior, and consequently its outcome.');
    context.print.green('The offical prefix is:');
    context.print.red(constants_1.default.AmplifyPrefix);
    context.print.info('');
}
function addPrefix(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var ADDCUSTOMPREFIX, options, addCustomPrefix, selectionAnswer, addNewAnswer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ADDCUSTOMPREFIX = 'Add custom prefix >';
                    options = [
                        constants_1.default.AmplifyPrefix,
                    ];
                    options = options.filter(function (item) { return !pluginPlatform.pluginPrefixes.includes(item.toString()); });
                    addCustomPrefix = false;
                    if (!(options.length > 0)) return [3 /*break*/, 2];
                    options.push(ADDCUSTOMPREFIX);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the prefix to add',
                            choices: options,
                        })];
                case 1:
                    selectionAnswer = _a.sent();
                    if (selectionAnswer.selection === ADDCUSTOMPREFIX) {
                        addCustomPrefix = true;
                    }
                    else {
                        pluginPlatform.pluginPrefixes.push(selectionAnswer.selection);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    addCustomPrefix = true;
                    _a.label = 3;
                case 3:
                    if (!addCustomPrefix) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'input',
                            name: 'newPrefix',
                            message: 'Enter the new prefix',
                            validate: function (input) {
                                input = input.trim();
                                if (input.length < MINPREFIXLENGTH || input.length > MAXPREFIXLENGTH) {
                                    return 'The Length of prefix must be between 2 and 20.';
                                }
                                if (!/^[a-zA-Z][a-zA-Z0-9-]+$/.test(input)) {
                                    return 'Prefix must start with letter, and contain only alphanumerics and dashes(-)';
                                }
                                return true;
                            },
                        })];
                case 4:
                    addNewAnswer = _a.sent();
                    pluginPlatform.pluginPrefixes.push(addNewAnswer.newPrefix.trim());
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function removePrefixes(pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_helper_1.default.prompt({
                        type: 'checkbox',
                        name: 'prefixesToRemove',
                        message: 'Select the prefixes to remove',
                        choices: pluginPlatform.pluginPrefixes,
                    })];
                case 1:
                    answer = _a.sent();
                    pluginPlatform.pluginPrefixes = pluginPlatform.pluginPrefixes.filter(function (prefix) { return !answer.prefixesToRemove.includes(prefix); });
                    return [2 /*return*/];
            }
        });
    });
}
function configureScanInterval(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.print.green('The Amplify CLI plugin platform regularly scans the local \
system to update its internal metadata on the locally installed plugins.');
                    context.print.green('This automatic scan will happen if the last scan \
time has passed for longer than max-scan-interval-in-seconds.');
                    context.print.info('');
                    display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'input',
                            name: 'interval',
                            message: 'Enter the max interval in seconds for automatic plugin scans',
                            default: pluginPlatform.maxScanIntervalInSeconds,
                            validate: function (input) {
                                if (isNaN(Number(input))) {
                                    return 'must enter nubmer';
                                }
                                return true;
                            },
                        })];
                case 1:
                    answer = _a.sent();
                    pluginPlatform.maxScanIntervalInSeconds = parseInt(answer.interval, 10);
                    display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
                    return [2 /*return*/];
            }
        });
    });
}
function listConfiguration(context, pluginPlatform) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginDirectories, pluginPrefixes, maxScanIntervalInSeconds, all, options, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginDirectories = 'plugin directories';
                    pluginPrefixes = 'plugin prefixes';
                    maxScanIntervalInSeconds = 'max scan interval in seconds';
                    all = 'all';
                    options = [
                        pluginDirectories,
                        pluginPrefixes,
                        maxScanIntervalInSeconds,
                        all,
                    ];
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Select the section to list',
                            choices: options,
                        })];
                case 1:
                    answer = _a.sent();
                    switch (answer.selection) {
                        case pluginDirectories:
                            display_plugin_platform_1.displayPluginDirectories(context, pluginPlatform);
                            break;
                        case pluginPrefixes:
                            display_plugin_platform_1.displayPrefixes(context, pluginPlatform);
                            break;
                        case maxScanIntervalInSeconds:
                            display_plugin_platform_1.displayScanInterval(context, pluginPlatform);
                            break;
                        case all:
                            display_plugin_platform_1.displayConfiguration(context, pluginPlatform);
                            break;
                        default:
                            display_plugin_platform_1.displayConfiguration(context, pluginPlatform);
                            break;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.listConfiguration = listConfiguration;
//# sourceMappingURL=../../../src/lib/commands/plugin/configure.js.map