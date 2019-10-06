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
var constants_1 = __importDefault(require("../../domain/constants"));
var plugin_manager_1 = require("../../plugin-manager");
var plugin_manager_2 = require("../../plugin-manager");
var add_plugin_result_1 = require("../../domain/add-plugin-result");
var path_1 = __importDefault(require("path"));
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginDirPath, isPluggedInLocalAmplifyCLI;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, plugin_manager_1.createNewPlugin(context, process.cwd())];
                case 1:
                    pluginDirPath = _a.sent();
                    if (!pluginDirPath) return [3 /*break*/, 3];
                    return [4 /*yield*/, plugIntoLocalAmplifyCli(context, pluginDirPath)];
                case 2:
                    isPluggedInLocalAmplifyCLI = _a.sent();
                    printInfo(context, pluginDirPath, isPluggedInLocalAmplifyCLI);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
function plugIntoLocalAmplifyCli(context, pluginDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var isPluggedIn, addPluginResult, error;
        return __generator(this, function (_a) {
            isPluggedIn = false;
            addPluginResult = plugin_manager_2.addUserPluginPackage(context.pluginPlatform, pluginDirPath);
            if (addPluginResult.isAdded) {
                isPluggedIn = true;
            }
            else {
                context.print.error('Failed to add the plugin package to the local Amplify CLI.');
                context.print.info("Error code: " + addPluginResult.error);
                if (addPluginResult.error === add_plugin_result_1.AddPluginError.FailedVerification &&
                    addPluginResult.pluginVerificationResult &&
                    addPluginResult.pluginVerificationResult.error) {
                    error = addPluginResult.pluginVerificationResult.error;
                    context.print.info("Plugin verification error code:  " + error);
                }
            }
            return [2 /*return*/, isPluggedIn];
        });
    });
}
// async function plugIntoLocalAmplifyCli(context: Context, pluginDirPath: string):
// Promise<boolean> {
//   let isPluggedIn = false;
//   const yesFlag = context.input.options && context.input.options[Constant.YES];
//   let ifPlugIntoLocalAmplifyCLI = true;
//   if (!yesFlag) {
//     context.print.info('The package can be plugged into the local Amplify CLI \
// for testing during development.');
//     const plugQuestion = {
//       type: 'confirm',
//       name: 'ifPlugIntoLocalAmplifyCLI',
//       message: 'Do you want this package plugged into the local Amplify CLI',
//       default: ifPlugIntoLocalAmplifyCLI,
//     };
//     const answer = await inquirer.prompt(plugQuestion);
//     ifPlugIntoLocalAmplifyCLI = answer.ifPlugIntoLocalAmplifyCLI;
//   }
//   if (ifPlugIntoLocalAmplifyCLI) {
//     const addPluginResult = addUserPluginPackage(context.pluginPlatform, pluginDirPath);
//     if (addPluginResult.isAdded) {
//       isPluggedIn = true;
//       await confirmAndScan(context.pluginPlatform);
//     } else {
//       context.print.error('Failed to add the plugin package.');
//       context.print.info(`Error code: ${addPluginResult.error}`);
//       if (addPluginResult.error === AddPluginError.FailedVerification &&
//                 addPluginResult.pluginVerificationResult &&
//                 addPluginResult.pluginVerificationResult.error) {
//         context.print.info(`Plugin verification error code: \
// ${addPluginResult.pluginVerificationResult.error}`);
//       }
//     }
//   }
//   return isPluggedIn;
// }
function printInfo(context, pluginDirPath, isPluggedInLocalAmplifyCLI) {
    context.print.info('');
    context.print.info("The plugin package " + path_1.default.basename(pluginDirPath) + "     has been successfully setup.");
    context.print.info('Next steps:');
    if (!isPluggedInLocalAmplifyCLI) {
        context.print.info("$ amplify plugin add: add the plugin into the local Amplify CLI for testing.");
    }
    var amplifyPluginJsonFilePath = path_1.default.normalize(path_1.default.join(pluginDirPath, constants_1.default.MANIFEST_FILE_NAME));
    var commandsDirPath = path_1.default.normalize(path_1.default.join(pluginDirPath, 'commands'));
    var eventHandlerDirPath = path_1.default.normalize(path_1.default.join(pluginDirPath, 'event-handlers'));
    context.print.info('');
    context.print.info('To add/remove command:');
    context.print.info('1. Add/remove the command name in the commands array in amplify-plugin.json.');
    context.print.green(amplifyPluginJsonFilePath);
    context.print.info('2. Add/remove the command code file in the commands folder.');
    context.print.green(commandsDirPath);
    context.print.info('');
    context.print.info('To add/remove eventHandlers:');
    context.print.info('1. Add/remove the event name in the eventHandlers array in amplify-plugin.json.');
    context.print.green(amplifyPluginJsonFilePath);
    context.print.info('2. Add/remove the event handler code file into the event-handler folder.');
    context.print.green(eventHandlerDirPath);
    context.print.info('');
}
//# sourceMappingURL=../../../src/lib/commands/plugin/new.js.map