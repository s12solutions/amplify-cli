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
var constants_1 = __importDefault(require("../domain/constants"));
var readJsonFile_1 = require("../utils/readJsonFile");
var plugin_verification_result_1 = __importDefault(require("../domain/plugin-verification-result"));
var plugin_verification_result_2 = require("../domain/plugin-verification-result");
function verifyPluginSync(pluginDirPath) {
    if (fs_extra_1.default.existsSync(pluginDirPath) && fs_extra_1.default.statSync(pluginDirPath).isDirectory()) {
        return verifyNodePackageSync(pluginDirPath);
    }
    return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.PluginDirPathNotExist);
}
exports.verifyPluginSync = verifyPluginSync;
function verifyPlugin(pluginDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var exists, stat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_extra_1.default.pathExists(pluginDirPath)];
                case 1:
                    exists = _a.sent();
                    if (!exists) return [3 /*break*/, 3];
                    return [4 /*yield*/, fs_extra_1.default.stat(pluginDirPath)];
                case 2:
                    stat = _a.sent();
                    if (!stat.isDirectory()) {
                        exists = false;
                    }
                    _a.label = 3;
                case 3:
                    if (exists) {
                        return [2 /*return*/, verifyNodePackage(pluginDirPath)];
                    }
                    return [2 /*return*/, new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.PluginDirPathNotExist)];
            }
        });
    });
}
exports.verifyPlugin = verifyPlugin;
function validPluginNameSync(pluginName) {
    var result = {
        isValid: true,
    };
    var corePluginJson = readJsonFile_1.readJsonFileSync(path_1.default.normalize(path_1.default.join(__dirname, '../../amplify-plugin.json')));
    if (corePluginJson && corePluginJson.commands && corePluginJson.commands.includes(pluginName)) {
        result.isValid = false;
        result.message = 'Amplify CLI core comand names can not be used as plugin name';
    }
    return result;
}
exports.validPluginNameSync = validPluginNameSync;
function validPluginName(pluginName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, corePluginJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = {
                        isValid: true,
                    };
                    return [4 /*yield*/, readJsonFile_1.readJsonFile(path_1.default.normalize(path_1.default.join(__dirname, '../../amplify-plugin.json')))];
                case 1:
                    corePluginJson = _a.sent();
                    if (corePluginJson && corePluginJson.commands && corePluginJson.commands.includes(pluginName)) {
                        result.isValid = false;
                        result.message = 'Amplify CLI core comand names can not be used as plugin name';
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.validPluginName = validPluginName;
function verifyNodePackageSync(pluginDirPath) {
    var pluginPackageJsonFilePath = path_1.default.join(pluginDirPath, constants_1.default.PACKAGEJSON_FILE_NAME);
    try {
        var packageJson = readJsonFile_1.readJsonFileSync(pluginPackageJsonFilePath);
        var pluginModule = require(pluginDirPath);
        var result = verifyAmplifyManifestSync(pluginDirPath, pluginModule);
        result.packageJson = packageJson;
        return result;
    }
    catch (err) {
        return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidNodePackage, err);
    }
}
function verifyNodePackage(pluginDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPackageJsonFilePath, packageJson, pluginModule, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginPackageJsonFilePath = path_1.default.join(pluginDirPath, constants_1.default.PACKAGEJSON_FILE_NAME);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, readJsonFile_1.readJsonFile(pluginPackageJsonFilePath)];
                case 2:
                    packageJson = _a.sent();
                    pluginModule = require(pluginDirPath);
                    return [4 /*yield*/, verifyAmplifyManifest(pluginDirPath, pluginModule)];
                case 3:
                    result = _a.sent();
                    result.packageJson = packageJson;
                    return [2 /*return*/, result];
                case 4:
                    err_1 = _a.sent();
                    return [2 /*return*/, new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidNodePackage, err_1)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function verifyAmplifyManifestSync(pluginDirPath, pluginModule) {
    var pluginManifestFilePath = path_1.default.join(pluginDirPath, constants_1.default.MANIFEST_FILE_NAME);
    if (!fs_extra_1.default.existsSync(pluginManifestFilePath) || !fs_extra_1.default.statSync(pluginManifestFilePath).isFile()) {
        return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.MissingManifest);
    }
    try {
        var manifest = readJsonFile_1.readJsonFileSync(pluginManifestFilePath);
        var pluginNameValidationResult = validPluginNameSync(manifest.name);
        if (pluginNameValidationResult.isValid) {
            var result = verifyCommands(manifest, pluginModule);
            result = result.verified ? verifyEventHandlers(manifest, pluginModule) : result;
            result.manifest = manifest;
            return result;
        }
        return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidManifest, pluginNameValidationResult.message);
    }
    catch (err) {
        return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidManifest, err);
    }
}
function verifyAmplifyManifest(pluginDirPath, pluginModule) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginManifestFilePath, exists, stat, manifest, pluginNameValidationResult, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginManifestFilePath = path_1.default.join(pluginDirPath, constants_1.default.MANIFEST_FILE_NAME);
                    return [4 /*yield*/, fs_extra_1.default.pathExists(pluginManifestFilePath)];
                case 1:
                    exists = _a.sent();
                    if (!exists) return [3 /*break*/, 3];
                    return [4 /*yield*/, fs_extra_1.default.stat(pluginManifestFilePath)];
                case 2:
                    stat = _a.sent();
                    exists = stat.isFile();
                    _a.label = 3;
                case 3:
                    if (!exists) {
                        return [2 /*return*/, new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.MissingManifest)];
                    }
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, readJsonFile_1.readJsonFile(pluginManifestFilePath)];
                case 5:
                    manifest = _a.sent();
                    return [4 /*yield*/, validPluginName(manifest.name)];
                case 6:
                    pluginNameValidationResult = _a.sent();
                    if (pluginNameValidationResult.isValid) {
                        result = verifyCommands(manifest, pluginModule);
                        result = result.verified ? verifyEventHandlers(manifest, pluginModule) : result;
                        result.manifest = manifest;
                        return [2 /*return*/, result];
                    }
                    return [2 /*return*/, new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidManifest, pluginNameValidationResult.message)];
                case 7:
                    err_2 = _a.sent();
                    return [2 /*return*/, new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.InvalidManifest, err_2)];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function verifyCommands(manifest, pluginModule) {
    //   let isVerified = true;
    //   if (manifest.commands && manifest.commands.length > 0) {
    //     isVerified = pluginModule.hasOwnProperty(constants.ExecuteAmplifyCommand) &&
    //         typeof pluginModule[constants.ExecuteAmplifyCommand] === 'function';
    //   }
    //   if (isVerified) {
    //     return new PluginVerificationResult(true);
    //   }
    //   return new PluginVerificationResult(
    //             false,
    //             PluginVerificationError.MissingExecuteAmplifyCommandMethod,
    //         );
    // verification should be on the plugin type and if it implement all the required METHODS;
    return new plugin_verification_result_1.default(true);
}
function verifyEventHandlers(manifest, pluginModule) {
    var isVerified = true;
    if (manifest.eventHandlers && manifest.eventHandlers.length > 0) {
        isVerified = pluginModule.hasOwnProperty(constants_1.default.HandleAmplifyEvent) &&
            typeof pluginModule[constants_1.default.HandleAmplifyEvent] === 'function';
    }
    if (isVerified) {
        return new plugin_verification_result_1.default(true);
    }
    return new plugin_verification_result_1.default(false, plugin_verification_result_2.PluginVerificationError.MissingHandleAmplifyEventMethod);
}
//# sourceMappingURL=../../src/lib/plugin-helpers/verify-plugin.js.map