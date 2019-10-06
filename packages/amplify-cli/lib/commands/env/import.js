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
var fs = require('fs-extra');
var path = require('path');
var readJsonFile = require('../../extensions/amplify-helpers/read-json-file').readJsonFile;
module.exports = {
    name: 'import',
    run: function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var envName, config, awsInfo, envFound, allEnvs, addNewEnvConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    envName = context.parameters.options.name;
                    if (!envName) {
                        context.print.error('You must pass in the name of the environment using the --name flag');
                        process.exit(1);
                    }
                    try {
                        config = JSON.parse(context.parameters.options.config);
                    }
                    catch (e) {
                        context.print.error('You must pass in the configs of the environment in an object format using the --config flag');
                        process.exit(1);
                    }
                    if (context.parameters.options.awsInfo) {
                        try {
                            awsInfo = JSON.parse(context.parameters.options.awsInfo);
                        }
                        catch (e) {
                            context.print.error('You must pass in the AWS credential info in an object format for intializating your environment using the --awsInfo flag');
                            process.exit(1);
                        }
                    }
                    envFound = false;
                    allEnvs = context.amplify.getEnvDetails();
                    Object.keys(allEnvs).forEach(function (env) {
                        if (env === envName) {
                            envFound = true;
                        }
                    });
                    addNewEnvConfig = function () {
                        var envProviderFilepath = context.amplify.pathManager.getProviderInfoFilePath();
                        allEnvs[envName] = config;
                        var jsonString = JSON.stringify(allEnvs, null, '\t');
                        fs.writeFileSync(envProviderFilepath, jsonString, 'utf8');
                        var dotConfigDirPath = context.amplify.pathManager.getDotConfigDirPath();
                        var configInfoFilePath = path.join(dotConfigDirPath, 'local-aws-info.json');
                        var envAwsInfo = {};
                        if (fs.existsSync(configInfoFilePath)) {
                            envAwsInfo = readJsonFile(configInfoFilePath);
                        }
                        envAwsInfo[envName] = awsInfo;
                        jsonString = JSON.stringify(envAwsInfo, null, 4);
                        fs.writeFileSync(configInfoFilePath, jsonString, 'utf8');
                        context.print.success('Successfully added environment from your project');
                    };
                    if (!envFound) return [3 /*break*/, 4];
                    if (!context.parameters.options.yes) return [3 /*break*/, 1];
                    addNewEnvConfig();
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, context.amplify.confirmPrompt.run('We found an environment with the same name. Do you want to overwrite existing enviornment config?')];
                case 2:
                    if (_a.sent()) {
                        addNewEnvConfig();
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    addNewEnvConfig();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); },
};
//# sourceMappingURL=../../../src/lib/commands/env/import.js.map