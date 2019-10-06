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
var inquirer_helper_1 = __importDefault(require("../domain/inquirer-helper"));
var constants_1 = __importDefault(require("../domain/constants"));
var amplify_event_1 = require("../domain/amplify-event");
var amplify_plugin_type_1 = require("../domain/amplify-plugin-type");
var readJsonFile_1 = require("../utils/readJsonFile");
var constants_2 = __importDefault(require("../domain/constants"));
var verify_plugin_1 = require("./verify-plugin");
var display_plugin_platform_1 = require("./display-plugin-platform");
var INDENTATIONSPACE = 4;
function createNewPlugin(context, pluginParentDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getPluginName(context, pluginParentDirPath)];
                case 1:
                    pluginName = _a.sent();
                    if (!pluginName) return [3 /*break*/, 3];
                    return [4 /*yield*/, copyAndUpdateTemplateFiles(context, pluginParentDirPath, pluginName)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [2 /*return*/, undefined];
            }
        });
    });
}
exports.default = createNewPlugin;
function getPluginName(context, pluginParentDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginName, yesFlag, pluginNameQuestion, answer, pluginDirPath, overwriteQuestion, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginName = 'my-amplify-plugin';
                    yesFlag = context.input.options && context.input.options[constants_1.default.YES];
                    if (!(context.input.subCommands.length > 1)) return [3 /*break*/, 1];
                    pluginName = context.input.subCommands[1];
                    return [3 /*break*/, 3];
                case 1:
                    if (!!yesFlag) return [3 /*break*/, 3];
                    pluginNameQuestion = {
                        type: 'input',
                        name: 'pluginName',
                        message: 'What should be the name of the plugin:',
                        default: pluginName,
                        validate: function (input) {
                            var pluginNameValidationResult = verify_plugin_1.validPluginNameSync(input);
                            if (!pluginNameValidationResult.isValid) {
                                return pluginNameValidationResult.message || 'Invalid plugin name';
                            }
                            return true;
                        },
                    };
                    return [4 /*yield*/, inquirer_helper_1.default.prompt(pluginNameQuestion)];
                case 2:
                    answer = _a.sent();
                    pluginName = answer.pluginName;
                    _a.label = 3;
                case 3:
                    pluginDirPath = path_1.default.join(pluginParentDirPath, pluginName);
                    if (!(fs_extra_1.default.existsSync(pluginDirPath) && !yesFlag)) return [3 /*break*/, 5];
                    context.print.error("The directory " + pluginName + " already exists");
                    overwriteQuestion = {
                        type: 'confirm',
                        name: 'ifOverWrite',
                        message: 'Do you want to overwrite it?',
                        default: false,
                    };
                    return [4 /*yield*/, inquirer_helper_1.default.prompt(overwriteQuestion)];
                case 4:
                    answer = _a.sent();
                    if (answer.ifOverWrite) {
                        return [2 /*return*/, pluginName];
                    }
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/, pluginName];
            }
        });
    });
}
function copyAndUpdateTemplateFiles(context, pluginParentDirPath, pluginName) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginDirPath, pluginType, eventHandlers, srcDirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginDirPath = path_1.default.join(pluginParentDirPath, pluginName);
                    fs_extra_1.default.emptyDirSync(pluginDirPath);
                    return [4 /*yield*/, promptForPluginType(context)];
                case 1:
                    pluginType = _a.sent();
                    return [4 /*yield*/, promptForEventSubscription(context)];
                case 2:
                    eventHandlers = _a.sent();
                    srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template');
                    if (pluginType === amplify_plugin_type_1.AmplifyPluginType.frontend.toString()) {
                        srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template-frontend');
                    }
                    else if (pluginType === amplify_plugin_type_1.AmplifyPluginType.provider.toString()) {
                        srcDirPath = path_1.default.join(__dirname, '../../templates/plugin-template-provider');
                    }
                    fs_extra_1.default.copySync(srcDirPath, pluginDirPath);
                    updatePackageJson(pluginDirPath, pluginName);
                    updateAmplifyPluginJson(pluginDirPath, pluginName, pluginType, eventHandlers);
                    updateEventHandlersFolder(pluginDirPath, eventHandlers);
                    return [2 /*return*/, pluginDirPath];
            }
        });
    });
}
function promptForPluginType(context) {
    return __awaiter(this, void 0, void 0, function () {
        var yesFlag, pluginTypes, LEARNMORE, choices, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    yesFlag = context.input.options && context.input.options[constants_1.default.YES];
                    if (yesFlag) {
                        return [2 /*return*/, amplify_plugin_type_1.AmplifyPluginType.util];
                    }
                    pluginTypes = Object.keys(amplify_plugin_type_1.AmplifyPluginType);
                    LEARNMORE = 'Learn more';
                    choices = pluginTypes.concat([LEARNMORE]);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'list',
                            name: 'selection',
                            message: 'Specify the plugin type',
                            choices: choices,
                            default: amplify_plugin_type_1.AmplifyPluginType.util,
                        })];
                case 1:
                    answer = _a.sent();
                    if (!(answer.selection === LEARNMORE)) return [3 /*break*/, 3];
                    displayAmplifyPluginTypesLearnMore(context);
                    return [4 /*yield*/, promptForPluginType(context)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [2 /*return*/, answer.selection];
            }
        });
    });
}
function displayAmplifyPluginTypesLearnMore(context) {
    context.print.green('The Amplify CLI supports these plugin types:');
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.category);
    context.print.green(amplify_plugin_type_1.AmplifyPluginType.category + " plugins allows the CLI user to add, remove and configure a set of backend resources. They in turn use provider plugins to provision these resources in the cloud.");
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.provider);
    context.print.green(amplify_plugin_type_1.AmplifyPluginType.provider + " plugins expose methods for other plugins like the category plugin to provision resources in the cloud. The Amplify CLI prompts the user to select provider plugins to initialize during the execution of the amplify init command (if there are multiple cloud provider plugins present), and then invoke the init method of the selected provider plugins.");
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.frontend);
    context.print.green(amplify_plugin_type_1.AmplifyPluginType.frontend + " plugins are responsible for detecting the frontend framework used by the frontend project and handle the frontend project and handle generation of all the configuration files required by the frontend framework.");
    context.print.red(amplify_plugin_type_1.AmplifyPluginType.util);
    context.print.green(amplify_plugin_type_1.AmplifyPluginType.util + " plugins are general purpose utility plugins, they provide utility functions for other plugins.");
    context.print.green('For more information please read - \
https://aws-amplify.github.io/docs/cli-toolchain/plugins');
}
function promptForEventSubscription(context) {
    return __awaiter(this, void 0, void 0, function () {
        var yesFlag, eventHandlers, LEARNMORE, choices, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    yesFlag = context.input.options && context.input.options[constants_1.default.YES];
                    eventHandlers = Object.keys(amplify_event_1.AmplifyEvent);
                    if (yesFlag) {
                        return [2 /*return*/, eventHandlers];
                    }
                    LEARNMORE = 'Learn more';
                    choices = eventHandlers.concat([LEARNMORE]);
                    return [4 /*yield*/, inquirer_helper_1.default.prompt({
                            type: 'checkbox',
                            name: 'selections',
                            message: 'What Amplify CLI events do you want the plugin to handle?',
                            choices: choices,
                            default: eventHandlers,
                        })];
                case 1:
                    answer = _a.sent();
                    if (!answer.selections.includes(LEARNMORE)) return [3 /*break*/, 3];
                    displayAmplifyEventsLearnMore(context);
                    return [4 /*yield*/, promptForEventSubscription(context)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [2 /*return*/, answer.selections];
            }
        });
    });
}
function displayAmplifyEventsLearnMore(context) {
    var indentationStr = display_plugin_platform_1.createIndentation(INDENTATIONSPACE);
    context.print.green('The Amplify CLI aims to provide a flexible and loosely-coupled \
pluggable platforms for the plugins.');
    context.print.green('To make this possible, \
the platform broadcasts events for plugins to handle.');
    context.print.green('If a plugin subscribes to an event, its event handler is \
invoked by the Amplify CLI Core on such event.');
    context.print.green('');
    context.print.green('The Amplify CLI currently broadcasts these events to plugins:');
    context.print.red(amplify_event_1.AmplifyEvent.PreInit);
    context.print.green("" + indentationStr + amplify_event_1.AmplifyEvent.PreInit + " handler is invoked prior to the execution of the amplify init command.");
    context.print.red(amplify_event_1.AmplifyEvent.PostInit);
    context.print.green("" + indentationStr + amplify_event_1.AmplifyEvent.PostInit + " handler is invoked on the complete execution of the amplify init command.");
    context.print.red(amplify_event_1.AmplifyEvent.PrePush);
    context.print.green("" + indentationStr + amplify_event_1.AmplifyEvent.PrePush + " handler is invoked prior to the executionof the amplify push command.");
    context.print.red(amplify_event_1.AmplifyEvent.PostPush);
    context.print.green("" + indentationStr + amplify_event_1.AmplifyEvent.PostPush + " handler is invoked on the complete execution of the amplify push command.");
    context.print.warning('This feature is currently under actively development, \
events might be added or removed in future releases');
}
function updatePackageJson(pluginDirPath, pluginName) {
    var filePath = path_1.default.join(pluginDirPath, 'package.json');
    var packageJson = readJsonFile_1.readJsonFileSync(filePath);
    packageJson.name = pluginName;
    var jsonString = JSON.stringify(packageJson, null, INDENTATIONSPACE);
    fs_extra_1.default.writeFileSync(filePath, jsonString, 'utf8');
}
function updateAmplifyPluginJson(pluginDirPath, pluginName, pluginType, eventHandlers) {
    var filePath = path_1.default.join(pluginDirPath, constants_2.default.MANIFEST_FILE_NAME);
    var amplifyPluginJson = readJsonFile_1.readJsonFileSync(filePath);
    amplifyPluginJson.name = pluginName;
    amplifyPluginJson.type = pluginType;
    amplifyPluginJson.eventHandlers = eventHandlers;
    var jsonString = JSON.stringify(amplifyPluginJson, null, INDENTATIONSPACE);
    fs_extra_1.default.writeFileSync(filePath, jsonString, 'utf8');
}
function updateEventHandlersFolder(pluginDirPath, eventHandlers) {
    var dirPath = path_1.default.join(pluginDirPath, 'event-handlers');
    var fileNames = fs_extra_1.default.readdirSync(dirPath);
    fileNames.forEach(function (fileName) {
        var eventName = fileName.replace('handle-', '').split('.')[0];
        if (!eventHandlers.includes(eventName)) {
            fs_extra_1.default.removeSync(path_1.default.join(dirPath, fileName));
        }
    });
}
//# sourceMappingURL=../../src/lib/plugin-helpers/create-new-plugin.js.map