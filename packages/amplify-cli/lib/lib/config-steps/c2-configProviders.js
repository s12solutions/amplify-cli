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
var inquirer = require('inquirer');
var sequential = require('promise-sequential');
var getProviderPlugins = require('../../extensions/amplify-helpers/get-provider-plugins').getProviderPlugins;
var normalizeProviderName = require('../input-params-manager').normalizeProviderName;
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var providerPlugins, currentProviders, selectedProviders, configTasks, initializationTasks, onInitSuccessfulTasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerPlugins = getProviderPlugins(context);
                    currentProviders = context.exeInfo.projectConfig.providers;
                    return [4 /*yield*/, configureProviders(context, providerPlugins, currentProviders)];
                case 1:
                    selectedProviders = _a.sent();
                    configTasks = [];
                    initializationTasks = [];
                    onInitSuccessfulTasks = [];
                    selectedProviders.forEach(function (provider) {
                        var providerModule = require(providerPlugins[provider]);
                        if (currentProviders.includes(provider)) {
                            configTasks.push(function () { return providerModule.configure(context); });
                        }
                        else {
                            initializationTasks.push(function () { return providerModule.init(context); });
                            onInitSuccessfulTasks.push(function () { return providerModule.onInitSuccessful(context); });
                        }
                    });
                    return [4 /*yield*/, sequential(configTasks)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sequential(initializationTasks)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, sequential(onInitSuccessfulTasks)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, context];
            }
        });
    });
}
function configureProviders(context, providerPlugins, currentProviders) {
    return __awaiter(this, void 0, void 0, function () {
        var providers, providerPluginList, inputParams, selectProviders, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providers = [];
                    providerPluginList = Object.keys(providerPlugins);
                    inputParams = context.exeInfo.inputParams;
                    if (inputParams.amplify.providers) {
                        inputParams.amplify.providers.forEach(function (provider) {
                            provider = normalizeProviderName(provider, providerPluginList);
                            if (provider) {
                                providers.push(provider);
                            }
                        });
                    }
                    if (!(providers.length === 0)) return [3 /*break*/, 3];
                    if (!(inputParams.yes || providerPluginList.length === 1)) return [3 /*break*/, 1];
                    context.print.info("Using default provider  " + providerPluginList[0]);
                    providers.push(providerPluginList[0]);
                    return [3 /*break*/, 3];
                case 1:
                    selectProviders = {
                        type: 'checkbox',
                        name: 'selectedProviders',
                        message: 'Select the backend providers.',
                        choices: providerPluginList,
                        default: currentProviders,
                    };
                    return [4 /*yield*/, inquirer.prompt(selectProviders)];
                case 2:
                    answer = _a.sent();
                    providers = answer.selectedProviders;
                    _a.label = 3;
                case 3: return [2 /*return*/, providers];
            }
        });
    });
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c2-configProviders.js.map