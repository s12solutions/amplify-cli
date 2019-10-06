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
var chalk = require('chalk');
var chalkpipe = require('chalk-pipe');
var fs = require('fs');
var fsExtra = require('fs-extra');
var flattenDeep = require('lodash').flattenDeep;
var join = require('path').join;
var uniq = require('lodash').uniq;
/** ADD A TRIGGER
 * @function addTrigger
 * @param {any} triggerOptions CLI context
 * {
 *  key: "PostConfirmation",
 *  values: ["add-to-group"]
 *  category: "amplify-category-auth",
 *  context: <cli-contex-object>,
 *  functionName:"parentAuthResourcePostConfirmation",
 *  parentResource:"parentAuthResource",
 *  parentStack: "auth"
 *  targetPath: "/<usersproject>/amplify/backend/function/vuedevca034d63PostConfirmation/src"
 *  triggerEnvs: {PostConfirmation: []}
 * }
 * @returns {object} {<TriggerName>: <functionName>}
 * { PostConfirmation: parentAuthResourcePostConfirmation}
 */
var addTrigger = function (triggerOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var key, values, context, functionName, _a, triggerEnvs, category, parentStack, targetPath, parentResource, triggerIndexPath, triggerPackagePath, triggerDir, triggerTemplate, triggerEventPath, skipEdit, add, v, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                key = triggerOptions.key, values = triggerOptions.values, context = triggerOptions.context, functionName = triggerOptions.functionName, _a = triggerOptions.triggerEnvs, triggerEnvs = _a === void 0 ? '[]' : _a, category = triggerOptions.category, parentStack = triggerOptions.parentStack, targetPath = triggerOptions.targetPath, parentResource = triggerOptions.parentResource, triggerIndexPath = triggerOptions.triggerIndexPath, triggerPackagePath = triggerOptions.triggerPackagePath, triggerDir = triggerOptions.triggerDir, triggerTemplate = triggerOptions.triggerTemplate, triggerEventPath = triggerOptions.triggerEventPath, skipEdit = triggerOptions.skipEdit;
                try {
                    (add = require('amplify-category-function').add);
                }
                catch (e) {
                    throw new Error('Function plugin not installed in the CLI. You need to install it to use this feature.');
                }
                return [4 /*yield*/, add(context, 'awscloudformation', 'Lambda', {
                        trigger: true,
                        modules: values,
                        parentResource: parentResource,
                        functionName: functionName,
                        parentStack: parentStack,
                        triggerEnvs: JSON.stringify(triggerEnvs[key]),
                        triggerIndexPath: triggerIndexPath,
                        triggerPackagePath: triggerPackagePath,
                        triggerDir: triggerDir,
                        triggerTemplate: triggerTemplate,
                        triggerEventPath: triggerEventPath,
                        roleName: functionName,
                        skipEdit: skipEdit,
                    })];
            case 1:
                _b.sent();
                context.print.success('Succesfully added the Lambda function locally');
                if (!(values && values.length > 0)) return [3 /*break*/, 5];
                v = 0;
                _b.label = 2;
            case 2:
                if (!(v < values.length)) return [3 /*break*/, 5];
                return [4 /*yield*/, copyFunctions(key, values[v], category, context, targetPath)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                v += 1;
                return [3 /*break*/, 2];
            case 5:
                result = {};
                result[key] = functionName;
                return [2 /*return*/, result];
        }
    });
}); };
/** UPDATE A TRIGGER
 * @function triggerFlow
 * @param {any} triggerOptions CLI context
 * {
 *  key: "PostConfirmation",
 *  values: ["add-to-group"]
 *  category: "amplify-category-auth",
 *  context: <cli-contex-object>,
 *  functionName:"parentAuthResourcePostConfirmation",
 *  parentResource:"parentAuthResource",
 *  parentStack: "auth"
 *  targetPath: "/<usersproject>/amplify/backend/function/vuedevca034d63PostConfirmation/src"
 *  triggerEnvs: {PostConfirmation: []}
 * }
 * @returns {null}
 */
var updateTrigger = function (triggerOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var key, values, context, functionName, _a, triggerEnvs, category, parentStack, targetPath, parentResource, triggerIndexPath, triggerPackagePath, triggerDir, triggerTemplate, triggerEventPath, skipEdit, update, v, projectBackendDirPath, parametersPath, dirContents, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                key = triggerOptions.key, values = triggerOptions.values, context = triggerOptions.context, functionName = triggerOptions.functionName, _a = triggerOptions.triggerEnvs, triggerEnvs = _a === void 0 ? '[]' : _a, category = triggerOptions.category, parentStack = triggerOptions.parentStack, targetPath = triggerOptions.targetPath, parentResource = triggerOptions.parentResource, triggerIndexPath = triggerOptions.triggerIndexPath, triggerPackagePath = triggerOptions.triggerPackagePath, triggerDir = triggerOptions.triggerDir, triggerTemplate = triggerOptions.triggerTemplate, triggerEventPath = triggerOptions.triggerEventPath, skipEdit = triggerOptions.skipEdit;
                try {
                    (update = require('amplify-category-function').update);
                }
                catch (e) {
                    throw new Error('Function plugin not installed in the CLI. You need to install it to use this feature.');
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                return [4 /*yield*/, update(context, 'awscloudformation', 'Lambda', {
                        trigger: true,
                        modules: values,
                        parentResource: parentResource,
                        functionName: functionName,
                        parentStack: parentStack,
                        triggerEnvs: JSON.stringify(triggerEnvs[key]),
                        triggerIndexPath: triggerIndexPath,
                        triggerPackagePath: triggerPackagePath,
                        triggerDir: triggerDir,
                        roleName: functionName,
                        triggerTemplate: triggerTemplate,
                        triggerEventPath: triggerEventPath,
                        skipEdit: skipEdit,
                    }, functionName)];
            case 2:
                _b.sent();
                if (!(values && values.length > 0)) return [3 /*break*/, 8];
                v = 0;
                _b.label = 3;
            case 3:
                if (!(v < values.length)) return [3 /*break*/, 6];
                return [4 /*yield*/, copyFunctions(key, values[v], category, context, targetPath)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                v += 1;
                return [3 /*break*/, 3];
            case 6:
                projectBackendDirPath = context.amplify.pathManager.getBackendDirPath();
                parametersPath = projectBackendDirPath + "/function/" + functionName;
                dirContents = fs.readdirSync(parametersPath);
                if (dirContents.includes('parameters.json')) {
                    fs.writeFileSync(parametersPath + "/parameters.json", JSON.stringify({ modules: values.join() }));
                }
                return [4 /*yield*/, cleanFunctions(key, values, category, context, targetPath)];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8:
                context.print.success('Succesfully updated the Lambda function locally');
                return [2 /*return*/, null];
            case 9:
                e_1 = _b.sent();
                throw new Error('Unable to update lambda function');
            case 10: return [2 /*return*/];
        }
    });
}); };
var deleteDeselectedTriggers = function (currentTriggers, previousTriggers, functionName, targetDir, context) { return __awaiter(void 0, void 0, void 0, function () {
    var p, targetPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                p = 0;
                _a.label = 1;
            case 1:
                if (!(p < previousTriggers.length)) return [3 /*break*/, 4];
                if (!!currentTriggers.includes(previousTriggers[p])) return [3 /*break*/, 3];
                targetPath = targetDir + "/function/" + previousTriggers[p];
                return [4 /*yield*/, context.amplify.deleteTrigger(context, "" + previousTriggers[p], targetPath)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                p += 1;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
var deleteTrigger = function (context, name, dir) { return __awaiter(void 0, void 0, void 0, function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, context.amplify.forceRemoveResource(context, 'function', name, dir)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                throw new Error('Function plugin not installed in the CLI. You need to install it to use this feature.');
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteAllTriggers = function (triggers, functionName, dir, context) { return __awaiter(void 0, void 0, void 0, function () {
    var previousKeys, y, targetPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                previousKeys = Object.keys(triggers);
                y = 0;
                _a.label = 1;
            case 1:
                if (!(y < previousKeys.length)) return [3 /*break*/, 4];
                targetPath = dir + "/function/" + functionName;
                return [4 /*yield*/, context.amplify.deleteTrigger(context, functionName, targetPath)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                y += 1;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @function triggerFlow
 * @param {object} context CLI context
 * @param {string} resource The provider (i.e. cognito)
 * @param {string} category The CLI category (i.e. amplify-category-auth)
 * @param {object} previousTriggers Object representing already configured triggers
 *  @example {"PostConfirmation":["add-to-group"]}
 * @returns {object} Object with current key/value pairs for triggers and templates
 */
var triggerFlow = function (context, resource, category, previousTriggers) {
    if (previousTriggers === void 0) { previousTriggers = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var functionName, wantTriggers, pluginPath, triggerPath, triggerOptions, triggerQuestion, triggerMeta, askTriggers, triggerObj, i, optionsPath, templateOptions, templateMeta, readableTrigger, templateQuestion, askTemplates, tempTriggerObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // handle missing params
                    if (!resource)
                        throw new Error('No resource provided to trigger question flow');
                    if (!category)
                        throw new Error('No category provided to trigger question flow');
                    functionName = "" + resource.charAt(0).toUpperCase() + resource.slice(1);
                    return [4 /*yield*/, inquirer.prompt({
                            name: 'confirmation',
                            type: 'confirm',
                            message: "Do you want to configure Lambda Triggers for " + functionName + "?",
                        })];
                case 1:
                    wantTriggers = _a.sent();
                    // if user does not want to manually configure triggers, return null
                    if (!wantTriggers.confirmation) {
                        return [2 /*return*/, null];
                    }
                    pluginPath = context.amplify.getCategoryPlugins(context)[category];
                    triggerPath = pluginPath + "/provider-utils/awscloudformation/triggers/";
                    triggerOptions = choicesFromMetadata(triggerPath, resource, true);
                    triggerQuestion = {
                        name: 'triggers',
                        type: 'checkbox',
                        message: "Which triggers do you want to enable for " + functionName,
                        choices: triggerOptions,
                        default: Object.keys(previousTriggers),
                    };
                    triggerMeta = context.amplify.getTriggerMetadata(triggerPath, resource);
                    return [4 /*yield*/, learnMoreLoop('triggers', functionName, triggerMeta, triggerQuestion)];
                case 2:
                    askTriggers = _a.sent();
                    triggerObj = {};
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < askTriggers.triggers.length)) return [3 /*break*/, 6];
                    optionsPath = triggerPath + "/" + askTriggers.triggers[i];
                    templateOptions = choicesFromMetadata(optionsPath, askTriggers.triggers[i]);
                    templateOptions.push({ name: 'Create your own module', value: 'custom' });
                    templateMeta = context.amplify.getTriggerMetadata(optionsPath, askTriggers.triggers[i]);
                    readableTrigger = triggerMeta[askTriggers.triggers[i]].name;
                    templateQuestion = {
                        name: 'templates',
                        type: 'checkbox',
                        message: "What functionality do you want to use for " + readableTrigger,
                        choices: templateOptions,
                        default: flattenDeep(previousTriggers[askTriggers.triggers[i]]),
                    };
                    return [4 /*yield*/, learnMoreLoop('templates', readableTrigger, templateMeta, templateQuestion)];
                case 4:
                    askTemplates = _a.sent();
                    triggerObj["" + askTriggers.triggers[i]] = askTemplates.templates;
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    tempTriggerObj = Object.assign({}, triggerObj);
                    Object.values(tempTriggerObj).forEach(function (t, index) {
                        if (!t || t.length < 1) {
                            delete triggerObj[Object.keys(tempTriggerObj)[index]];
                        }
                    }, { triggerObj: triggerObj });
                    return [2 /*return*/, triggerObj];
            }
        });
    });
};
/**
 * @function getTriggerPermissions
 * @param {object} context CLI context
 * @param {string} triggers Serialized trigger object
 * @param {string} category The CLI category (i.e. amplify-category-auth)
 * @returns {array} Array of serialized permissions objects
 * @example ["{
 *    "policyName": "AddToGroup",
 *    "trigger": "PostConfirmation",
 *    "actions": ["cognito-idp:AdminAddUserToGroup"],
 *    "resources": [
 *      {
 *        "type": "UserPool",
 *        "attribute": "Arn"
 *      }
 *    ]
 *  }"]
 */
var getTriggerPermissions = function (context, triggers, category) { return __awaiter(void 0, void 0, void 0, function () {
    var permissions, parsedTriggers, triggerKeys, pluginPath, c, index, meta, moduleKeys, v;
    return __generator(this, function (_a) {
        permissions = [];
        parsedTriggers = JSON.parse(triggers);
        triggerKeys = Object.keys(parsedTriggers);
        pluginPath = context.amplify.getCategoryPlugins(context)[category];
        for (c = 0; c < triggerKeys.length; c += 1) {
            index = triggerKeys[c];
            meta = context.amplify.getTriggerMetadata(pluginPath + "/provider-utils/awscloudformation/triggers/" + index, index);
            moduleKeys = Object.keys(meta);
            for (v = 0; v < moduleKeys.length; v += 1) {
                if (parsedTriggers[index].includes(moduleKeys[v]) && meta[moduleKeys[v]].permissions) {
                    permissions = permissions.concat(meta[moduleKeys[v]].permissions);
                }
            }
        }
        permissions = permissions.map(function (i) { return JSON.stringify(i); });
        return [2 /*return*/, permissions];
    });
}); };
// helper function to show help text and redisplay question if 'learn more' is selected
var learnMoreLoop = function (key, map, metaData, question) { return __awaiter(void 0, void 0, void 0, function () {
    var selections, _loop_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, inquirer.prompt(question)];
            case 1:
                selections = _a.sent();
                _loop_1 = function () {
                    var prefix;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (metaData.URL) {
                                    prefix = "\nAdditional information about the " + key + " available for " + map + " can be found here: " + chalkpipe(null, chalk.blue.underline)(metaData.URL) + "\n";
                                    prefix = prefix.concat('\n');
                                }
                                else {
                                    prefix = "\nThe following " + key + " are available in " + map + "\n";
                                    Object.values(metaData).forEach(function (m) {
                                        prefix = prefix.concat('\n');
                                        prefix = prefix.concat(chalkpipe(null, chalk.green)('\nName:') + " " + m.name + chalkpipe(null, chalk.green)('\nDescription:') + " " + m.description + "\n");
                                        prefix = prefix.concat('\n');
                                    });
                                }
                                question.prefix = prefix;
                                return [4 /*yield*/, inquirer.prompt(question)];
                            case 1:
                                selections = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _a.label = 2;
            case 2:
                if (!
                // handle answers that are strings or arrays
                (Array.isArray(selections[key]) && selections[key].includes('learn'))) return [3 /*break*/, 4];
                return [5 /*yield**/, _loop_1()];
            case 3:
                _a.sent();
                return [3 /*break*/, 2];
            case 4: return [2 /*return*/, selections];
        }
    });
}); };
// get triggerFlow options based on metadata stored in trigger directory;
var choicesFromMetadata = function (path, selection, isDir) {
    var templates = isDir ?
        fs.readdirSync(path)
            .filter(function (f) { return fs.statSync(join(path, f)).isDirectory(); }) :
        fs.readdirSync(path).map(function (t) { return t.substring(0, t.length - 3); });
    var metaData = getTriggerMetadata(path, selection);
    var configuredOptions = Object.keys(metaData).filter(function (k) { return templates.includes(k); });
    var options = configuredOptions.map(function (c) { return ({ name: "" + metaData[c].name, value: c }); });
    // add learn more w/ seperator
    options.unshift(new inquirer.Separator());
    options.unshift({ name: 'Learn More', value: 'learn' });
    return options;
};
// get metadata from a particular file
var getTriggerMetadata = function (path, selection) { return JSON.parse(fs.readFileSync(path + "/" + selection + ".map.json")); };
// open customer's text editor
function openEditor(context, path, name) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = path + "/" + name + ".js";
                    return [4 /*yield*/, context.amplify.confirmPrompt.run("Do you want to edit your " + name + " function now?")];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, context.amplify.openEditor(context, filePath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var copyFunctions = function (key, value, category, context, targetPath) { return __awaiter(void 0, void 0, void 0, function () {
    var dirContents, pluginPath, functionPath, source, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!fs.existsSync(targetPath)) {
                    fs.mkdirSync(targetPath);
                }
                dirContents = fs.readdirSync(targetPath);
                pluginPath = context.amplify.getCategoryPlugins(context)[category];
                functionPath = context.amplify.getCategoryPlugins(context).function;
                if (!!dirContents.includes(value + ".js")) return [3 /*break*/, 2];
                source = '';
                if (value === 'custom') {
                    source = functionPath + "/provider-utils/awscloudformation/function-template-dir/trigger-custom.js";
                }
                else {
                    source = pluginPath + "/provider-utils/awscloudformation/triggers/" + key + "/" + value + ".js";
                }
                fsExtra.copySync(source, targetPath + "/" + value + ".js");
                return [4 /*yield*/, openEditor(context, targetPath, value)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                throw new Error('Error copying functions');
            case 4: return [2 /*return*/];
        }
    });
}); };
var cleanFunctions = function (key, values, category, context, targetPath) { return __awaiter(void 0, void 0, void 0, function () {
    var pluginPath, meta, dirContents, x;
    return __generator(this, function (_a) {
        pluginPath = context.amplify.getCategoryPlugins(context)[category];
        try {
            meta = context.amplify.getTriggerMetadata(pluginPath + "/provider-utils/awscloudformation/triggers/" + key, key);
            dirContents = fs.readdirSync(targetPath);
            for (x = 0; x < dirContents.length; x += 1) {
                if (dirContents[x] !== 'custom.js') {
                    // checking that a file is js module (with extension removed) and not a selected module
                    if (meta["" + dirContents[x].substring(0, dirContents[x].length - 3)] &&
                        !values.includes("" + dirContents[x].substring(0, dirContents[x].length - 3))) {
                        try {
                            fs.unlinkSync(targetPath + "/" + dirContents[x]);
                        }
                        catch (e) {
                            throw new Error('Failed to delete module');
                        }
                    }
                }
                if (dirContents[x] === 'custom.js' && !values.includes('custom')) {
                    try {
                        fs.unlinkSync(targetPath + "/" + dirContents[x]);
                    }
                    catch (e) {
                        throw new Error('Failed to delete module');
                    }
                }
            }
        }
        catch (e) {
            throw new Error('Error cleaning functions');
        }
        return [2 /*return*/, null];
    });
}); };
var getTriggerEnvVariables = function (context, trigger, category) {
    var pluginPath = context.amplify.getCategoryPlugins(context)[category];
    var env = [];
    var meta = context.amplify.getTriggerMetadata(pluginPath + "/provider-utils/awscloudformation/triggers/" + trigger.key, trigger.key);
    if (trigger.modules) {
        for (var x = 0; x < trigger.modules.length; x++) {
            if (meta[trigger.modules[x]] && meta[trigger.modules[x]].env) {
                var newEnv = meta[trigger.modules[x]].env.filter(function (a) { return !a.question; });
                env = env.concat(newEnv);
            }
        }
        return env;
    }
    return null;
};
var getTriggerEnvInputs = function (context, path, triggerKey, triggerValues, currentEnvVars) { return __awaiter(void 0, void 0, void 0, function () {
    var metadata, intersection, answers, i, questions, j, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                metadata = context.amplify.getTriggerMetadata(path, triggerKey);
                intersection = Object.keys(metadata).filter(function (value) { return triggerValues.includes(value); });
                answers = {};
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < intersection.length)) return [3 /*break*/, 6];
                if (!metadata[intersection[i]].env) return [3 /*break*/, 5];
                questions = metadata[intersection[i]].env.filter(function (m) { return m.question; });
                if (!(questions && questions.length)) return [3 /*break*/, 5];
                j = 0;
                _a.label = 2;
            case 2:
                if (!(j < questions.length)) return [3 /*break*/, 5];
                if (!(!currentEnvVars ||
                    (Object.keys(currentEnvVars) && Object.keys(currentEnvVars).length === 0) ||
                    !currentEnvVars[questions[j].key])) return [3 /*break*/, 4];
                return [4 /*yield*/, inquirer.prompt(questions[j].question)];
            case 3:
                answer = _a.sent();
                answers[questions[j].key] = answer[questions[j].key];
                _a.label = 4;
            case 4:
                j += 1;
                return [3 /*break*/, 2];
            case 5:
                i += 1;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/, Object.assign(answers, currentEnvVars)];
        }
    });
}); };
var dependsOnBlock = function (context, triggerKeys, provider) {
    if (triggerKeys === void 0) { triggerKeys = []; }
    if (!context)
        throw new Error('No context provided to dependsOnBlock');
    if (!provider)
        throw new Error('No provider provided to dependsOnBlock');
    var dependsOnArray = context.updatingAuth && context.updatingAuth.dependsOn ?
        context.updatingAuth.dependsOn :
        [];
    triggerKeys.forEach(function (l) {
        if (!dependsOnArray.find(function (a) { return a.resourceName === l; })) {
            dependsOnArray.push({
                category: 'function',
                resourceName: l,
                triggerProvider: provider,
                attributes: ['Arn', 'Name'],
            });
        }
    });
    var tempArray = Object.assign([], dependsOnArray);
    tempArray.forEach(function (x) {
        if (x.triggerProvider === provider && !triggerKeys.includes(x.resourceName)) {
            var index = dependsOnArray.findIndex(function (i) { return i.resourceName === x.resourceName; });
            dependsOnArray.splice(index, 1);
        }
    });
    return uniq(dependsOnArray);
};
module.exports = {
    triggerFlow: triggerFlow,
    addTrigger: addTrigger,
    choicesFromMetadata: choicesFromMetadata,
    updateTrigger: updateTrigger,
    deleteTrigger: deleteTrigger,
    deleteAllTriggers: deleteAllTriggers,
    deleteDeselectedTriggers: deleteDeselectedTriggers,
    dependsOnBlock: dependsOnBlock,
    getTriggerMetadata: getTriggerMetadata,
    getTriggerPermissions: getTriggerPermissions,
    getTriggerEnvVariables: getTriggerEnvVariables,
    getTriggerEnvInputs: getTriggerEnvInputs,
    copyFunctions: copyFunctions,
    cleanFunctions: cleanFunctions,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/trigger-flow.js.map