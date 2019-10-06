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
var plugin_manager_1 = require("./plugin-manager");
var input_manager_1 = require("./input-manager");
var context_manager_1 = require("./context-manager");
var context_extensions_1 = require("./context-extensions");
var execution_manager_1 = require("./execution-manager");
var constants_1 = __importDefault(require("./domain/constants"));
var path = __importStar(require("path"));
// entry from commandline
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPlatform, input, verificationResult, context, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, plugin_manager_1.getPluginPlatform()];
                case 1:
                    pluginPlatform = _a.sent();
                    input = input_manager_1.getCommandLineInput(pluginPlatform);
                    verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
                    if (!!verificationResult.verified) return [3 /*break*/, 3];
                    if (verificationResult.message) {
                        context_extensions_1.print.warning(verificationResult.message);
                    }
                    return [4 /*yield*/, plugin_manager_1.scan()];
                case 2:
                    pluginPlatform = _a.sent();
                    input = input_manager_1.getCommandLineInput(pluginPlatform);
                    verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
                    _a.label = 3;
                case 3:
                    if (!verificationResult.verified) {
                        if (verificationResult.helpCommandAvailable) {
                            input.command = constants_1.default.HELP;
                        }
                        else {
                            throw new Error(verificationResult.message);
                        }
                    }
                    context = context_manager_1.constructContext(pluginPlatform, input);
                    return [4 /*yield*/, execution_manager_1.executeCommand(context)];
                case 4:
                    _a.sent();
                    context_manager_1.persistContext(context);
                    return [2 /*return*/, 0];
                case 5:
                    e_1 = _a.sent();
                    // ToDo: add logging to the core, and log execution errors using the unified core logging.
                    if (e_1.message) {
                        context_extensions_1.print.error(e_1.message);
                    }
                    if (e_1.stack) {
                        context_extensions_1.print.info(e_1.stack);
                    }
                    return [2 /*return*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
// entry from library call
function execute(input) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPlatform, verificationResult, context, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, plugin_manager_1.getPluginPlatform()];
                case 1:
                    pluginPlatform = _a.sent();
                    verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
                    if (!!verificationResult.verified) return [3 /*break*/, 3];
                    if (verificationResult.message) {
                        context_extensions_1.print.warning(verificationResult.message);
                    }
                    return [4 /*yield*/, plugin_manager_1.scan()];
                case 2:
                    pluginPlatform = _a.sent();
                    verificationResult = input_manager_1.verifyInput(pluginPlatform, input);
                    _a.label = 3;
                case 3:
                    if (!verificationResult.verified) {
                        if (verificationResult.helpCommandAvailable) {
                            input.command = constants_1.default.HELP;
                        }
                        else {
                            throw new Error(verificationResult.message);
                        }
                    }
                    context = context_manager_1.constructContext(pluginPlatform, input);
                    return [4 /*yield*/, execution_manager_1.executeCommand(context)];
                case 4:
                    _a.sent();
                    context_manager_1.persistContext(context);
                    return [2 /*return*/, 0];
                case 5:
                    e_2 = _a.sent();
                    // ToDo: add logging to the core, and log execution errors using the unified core logging.
                    if (e_2.message) {
                        context_extensions_1.print.error(e_2.message);
                    }
                    if (e_2.stack) {
                        context_extensions_1.print.info(e_2.stack);
                    }
                    return [2 /*return*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
function executeAmplifyCommand(context) {
    return __awaiter(this, void 0, void 0, function () {
        var commandPath, commandModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commandPath = path.normalize(path.join(__dirname, 'commands', context.input.command));
                    commandModule = require(commandPath);
                    return [4 /*yield*/, commandModule.run(context)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.executeAmplifyCommand = executeAmplifyCommand;
//# sourceMappingURL=../src/lib/index.js.map